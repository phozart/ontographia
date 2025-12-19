// pages/negotiation-studio.js
// N&P Sensemaking Studio - Negotiation & Persuasion preparation tool

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../components/AuthContext';
import { NPProvider } from '../components/np/NPContext';
import NPWorkspace from '../components/np/NPWorkspace';

export default function NegotiationStudioPage() {
  const { user, hydrated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hydrated) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>N&P Studio | Ontographia</title>
        <meta name="description" content="Negotiation & Persuasion Sensemaking Studio" />
      </Head>

      <NPProvider>
        <div className="np-studio-page">
          <NPWorkspace />
        </div>
      </NPProvider>

      <style jsx>{`
        .np-studio-page {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color, #e5e7eb);
          border-top-color: var(--primary-color, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
