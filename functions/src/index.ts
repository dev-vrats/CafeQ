import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBKrYlxakAgwXSzqx1j5CpRLLsvM2XPFJo";

import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const chatWithGemini = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { message } = data;
  if (!message) {
    throw new HttpsError('invalid-argument', 'Message is required!');
  }

  try {
    // 1. Fetch live menu
    const menuSnap = await admin.firestore().collection('menu').where('available', '==', true).get();
    const menuItems = menuSnap.docs.map(doc => doc.data());
    const menuString = menuItems.map(item => `${item.name} (₹${item.price}) - ${item.category}`).join('\n');

    // 2. Fetch rush meter
    const rushSnap = await admin.firestore().collection('rushMeter').doc('current').get();
    const rushMeter = rushSnap.data() || { level: 'relaxed' };

    // 3. System prompt grounding
    const systemInstruction = `You are a friendly, concise AI assistant for CafeQ, a college campus Nescafe kiosk.
    Current Time: ${new Date().toLocaleTimeString()}
    Current Rush Level: ${rushMeter.level} (If busy or jammed, suggest quick items like beverages, not complex food).
    
    Live Menu (Only suggest these items):
    ${menuString}
    
    Keep responses short (under 2 sentences) and highly relevant to ordering food/drinks from the menu.`;

    // 4. Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
      })
    });

    const result = await response.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

    return { response: aiText };
  } catch (error) {
    console.error("Gemini API Error", error);
    throw new HttpsError('internal', 'Failed to generate response.');
  }
});
