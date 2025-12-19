// pages/learning-studio.js - Academic Learning Studio main page
import Head from 'next/head';
import { ALSProvider } from '../components/als/ALSContext';
import ALSWorkspace from '../components/als/ALSWorkspace';

export default function LearningStudioPage() {
  return (
    <>
      <Head>
        <title>Learning Studio | Ontographia</title>
        <meta name="description" content="Academic learning and meta-cognition studio" />
      </Head>
      <ALSProvider>
        <ALSWorkspace />
      </ALSProvider>
    </>
  );
}
