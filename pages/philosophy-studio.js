// pages/philosophy-studio.js - Philosophical & Critical Thinking Studio
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth, useRouteGuard } from '../components/AuthContext';
import PhilosophyWorkspace from '../components/philosophy/PhilosophyWorkspace';

export default function PhilosophyStudioPage() {
  const { enforceRoute } = useRouteGuard();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated) enforceRoute();
  }, [hydrated, enforceRoute]);

  if (!hydrated) return null;
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Philosophy Studio | Ontographia</title>
        <meta name="description" content="Philosophical and critical thinking workspace" />
      </Head>
      <PhilosophyWorkspace />
    </>
  );
}
