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
exports.callAI = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Helper: call the Generative AI REST endpoint if official client not available
async function callGeminiApi(prompt, model = 'models/text-bison-001') {
    const apiKey = functions.config().generative?.api_key || process.env.GENERATIVE_API_KEY;
    if (!apiKey)
        throw new functions.https.HttpsError('failed-precondition', 'Generative API key not configured.');
    const res = await fetch(`https://generative.googleapis.com/v1/${model}:generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            prompt: { text: prompt },
            temperature: 0.2,
            maxOutputTokens: 512,
        }),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new functions.https.HttpsError('internal', `Generative API error: ${res.status} ${body}`);
    }
    return res.json();
}
exports.callAI = functions.https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const text = data?.text;
    const tasks = data?.tasks || ['summarize'];
    if (!text || typeof text !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Missing `text` string in request.');
    }
    const results = {};
    try {
        if (tasks.includes('summarize')) {
            const prompt = `Summarize the following text in 3 bullet points:\n\n${text}`;
            const summary = await callGeminiApi(prompt);
            results.summary = summary;
        }
        if (tasks.includes('extract_actions')) {
            const prompt = `Extract action items from the following text as a JSON array of objects with {action, assignee?, due?}:\n\n${text}`;
            const actions = await callGeminiApi(prompt);
            results.actions = actions;
        }
        return { results };
    }
    catch (err) {
        // Surface safe error message
        throw new functions.https.HttpsError('internal', err.message || 'AI call failed');
    }
});
