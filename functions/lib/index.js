"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithGemini = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBKrYlxakAgwXSzqx1j5CpRLLsvM2XPFJo";
const https_1 = require("firebase-functions/v2/https");
exports.chatWithGemini = (0, https_1.onCall)(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    const { message } = data;
    if (!message) {
        throw new https_1.HttpsError('invalid-argument', 'Message is required!');
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
    }
    catch (error) {
        console.error("Gemini API Error", error);
        throw new https_1.HttpsError('internal', 'Failed to generate response.');
    }
});
//# sourceMappingURL=index.js.map