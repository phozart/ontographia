// pages/change-management.js
// Change Management Studio - Base page component

import Head from 'next/head';
import { ChangeProvider } from '../components/cm/ChangeContext';
import ChangeStudio from '../components/cm/ChangeStudio';

export default function ChangeManagementPage() {
  return (
    <>
      <Head>
        <title>Change Studio | Ontographia</title>
      </Head>
      <ChangeProvider>
        <ChangeStudio />
      </ChangeProvider>
    </>
  );
}
