import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { StudentHome } from './pages/StudentHome';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { Game } from './pages/Game';
import { Loyalty } from './pages/Loyalty';
import { Pass } from './pages/Pass';
import { GroupOrders } from './pages/GroupOrders';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Chatbot } from './components/Chatbot';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { profile } = useAuth();
  return (
    <>
      <main className="pt-32 pb-16 px-4 sm:px-6 max-w-[90%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl mr-auto flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <StudentHome />
            </ProtectedRoute>
          } />
          
          <Route path="/menu" element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/order/:orderId" element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          } />

          <Route path="/game" element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty" element={
            <ProtectedRoute>
              <Loyalty />
            </ProtectedRoute>
          } />

          <Route path="/pass" element={
            <ProtectedRoute>
              <Pass />
            </ProtectedRoute>
          } />

          <Route path="/group-orders" element={
            <ProtectedRoute>
              <GroupOrders />
            </ProtectedRoute>
          } />

          {/* Owner Routes */}
          <Route path="/owner" element={
            <ProtectedRoute requireOwner>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {profile?.role === 'student' && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
