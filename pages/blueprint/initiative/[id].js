// pages/blueprint/initiative/[id].js
// Individual initiative detail page

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { BlueprintProvider, useBlueprint } from '../../../components/spaces/blueprint';
import Layout from '../../../components/Layout';
import InitiativeDetail from '../../../components/spaces/blueprint/initiative/InitiativeDetail';

function InitiativeDetailContent() {
  const router = useRouter();
  const { id } = router.query;
  const { initiatives, setActiveInitiative } = useBlueprint();
  const [initiative, setInitiative] = useState(null);

  useEffect(() => {
    if (id && initiatives.length > 0) {
      const found = initiatives.find(i => i.id === id || i.display_id === id);
      if (found) {
        setInitiative(found);
        setActiveInitiative(found);
      }
    }
  }, [id, initiatives, setActiveInitiative]);

  const handleNavigate = (view) => {
    router.push(`/blueprint?view=${view}`);
  };

  if (!initiative) {
    return (
      <div className="initiative-loading">
        <p>Loading initiative...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{initiative.display_id}: {initiative.name} | Blueprint Studio</title>
      </Head>
      <div className="initiative-page">
        <InitiativeDetail
          initiative={initiative}
          onNavigate={handleNavigate}
          onClose={() => router.push('/blueprint')}
        />
      </div>
    </>
  );
}

export default function InitiativeDetailPage() {
  return (
    <Layout>
      <BlueprintProvider>
        <InitiativeDetailContent />
      </BlueprintProvider>
    </Layout>
  );
}
