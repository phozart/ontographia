// pages/user/home.js
// Redirect to canonical /home route
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UserHomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home');
  }, [router]);
  return null;
}
