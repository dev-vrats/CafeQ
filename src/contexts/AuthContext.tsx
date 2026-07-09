import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  role: 'student' | 'owner' | 'none';
  name: string | null;
  phone: string | null;
  photoUrl: string | null;
  loyalty: { coffee: number };
  khata: { due: number };
  pass?: { validUntil: number; balance: number };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  claimOwner: () => Promise<void>;
  claimStudent: () => Promise<void>;
  ownerClaimAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  claimOwner: async () => {},
  claimStudent: async () => {},
  ownerClaimAvailable: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerClaimAvailable, setOwnerClaimAvailable] = useState(false);

  useEffect(() => {
    // Check if owner claim is available (config/owner has ownerUid == null)
    const checkOwnerStatus = async () => {
      try {
        const ownerDoc = await getDoc(doc(db, 'config', 'owner'));
        if (!ownerDoc.exists() || ownerDoc.data()?.ownerUid == null) {
          setOwnerClaimAvailable(true);
        } else {
          setOwnerClaimAvailable(false);
        }
      } catch (e) {
        console.error("Failed to check owner status", e);
      }
    };
    
    checkOwnerStatus();

    let profileUnsub: (() => void) | undefined;

    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = undefined;
      }

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Create default profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              role: 'none',
              name: currentUser.displayName || '',
              phone: currentUser.phoneNumber || '',
              photoUrl: currentUser.photoURL || '',
              loyalty: { coffee: 0 },
              khata: { due: 0 }
            };
            await setDoc(userRef, newProfile);
          }

          profileUnsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
          });
        } catch (error) {
          console.error("Error setting up user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const claimOwner = async () => {
    if (!user || !profile) return;
    try {
      // Set config/owner
      await setDoc(doc(db, 'config', 'owner'), { ownerUid: user.uid }, { merge: true });
      // Update user role
      await setDoc(doc(db, 'users', user.uid), { role: 'owner' }, { merge: true });
      setProfile({ ...profile, role: 'owner' });
      setOwnerClaimAvailable(false);
    } catch (e) {
      console.error("Failed to claim owner", e);
      alert("Failed to claim owner. It might have already been claimed.");
    }
  };

  const claimStudent = async () => {
    if (!user || !profile) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { role: 'student' }, { merge: true });
      setProfile({ ...profile, role: 'student' });
    } catch (e) {
      console.error("Failed to set student role", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, claimOwner, claimStudent, ownerClaimAvailable }}>
      {children}
    </AuthContext.Provider>
  );
};
