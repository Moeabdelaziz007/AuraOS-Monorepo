import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Types for request/response
type CallAIRequest = {
  text: string;
  tasks?: Array<'summarize' | 'extract_actions'>;
};

type CallAIResponse = {
  results: Record<string, any>;
};

// Helper: call the Generative AI REST endpoint if official client not available
async function callGeminiApi(prompt: string, model = 'models/text-bison-001') {
  const apiKey = functions.config().generative?.api_key || process.env.GENERATIVE_API_KEY;
  if (!apiKey) throw new functions.https.HttpsError('failed-precondition', 'Generative API key not configured.');

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

export const callAI = functions.https.onCall(async (data: CallAIRequest, context: functions.https.CallableContext): Promise<CallAIResponse> => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const text = data?.text;
  const tasks = data?.tasks || ['summarize'];

  if (!text || typeof text !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing `text` string in request.');
  }

  const results: Record<string, any> = {};

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
  } catch (err: any) {
    // Surface safe error message
    throw new functions.https.HttpsError('internal', err.message || 'AI call failed');
  }
});
