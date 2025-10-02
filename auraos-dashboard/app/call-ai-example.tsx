'use client';

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../lib/firebase'; // Assuming firebase is initialized here

const functions = getFunctions(app);
const callAI = httpsCallable(functions, 'callAI');

const CallAIExample: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user as any);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCallAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await callAI({
        text: 'Create a project plan for a new AI-powered OS. Include milestones for UI, core, and AI services.',
        tasks: ['summarize', 'extract_actions'],
      });
      setResult(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Cloud Function AI Caller</h2>
      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleCallAI} disabled={loading}>
            {loading ? 'Calling AI...' : 'Call AI Function'}
          </button>
        </div>
      )}

      {error && <pre style={{ color: 'red' }}>Error: {error}</pre>}
      {result && (
        <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>
          <h3>AI Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CallAIExample;
