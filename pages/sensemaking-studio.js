// pages/sensemaking-studio.js - Mental Models & Sensemaking Studio
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth, useRouteGuard } from '../components/AuthContext';
import MMSWorkspace from '../components/mms/MMSWorkspace';

export default function SensemakingStudioPage() {
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
        <title>Sensemaking Studio | Ontographia</title>
        <meta name="description" content="Mental models and sensemaking workspace" />
      </Head>
      <MMSWorkspace />
    </>
  );
}
