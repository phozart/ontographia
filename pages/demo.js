import { useEffect } from 'react';
import { useRouter } from 'next/router';

export async function getServerSideProps({ res }) {
  res.setHeader('Set-Cookie', `demo_mode=1; Path=/; SameSite=Lax`);
  return {
    props: {},
  };
}

export default function DemoPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      window.localStorage.setItem('kg-auth', JSON.stringify({ user: 'demo', role: 'admin' }));
    } catch (e) {
      // ignore
    }
    // Force a reload so auth is picked up immediately
    window.location.replace('/home');
  }, [router]);
  return null;
}
