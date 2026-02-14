import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import LoginIcon from '@mui/icons-material/Login';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '@/components/AuthContext';
import { getSpace, isValidView } from '@/lib/spaceRegistry';

const MindLabWorkspace = dynamic(() => import('@/components/spaces/mindlab/MindLabWorkspace'), { ssr: false });
const MindLabProvider = dynamic(() => import('@/components/spaces/mindlab/MindLabContext').then(mod => ({ default: ({ children }) => <mod.MindLabProvider>{children}</mod.MindLabProvider> })), { ssr: false });

export default function MindLabPage() {
  const router = useRouter();
  const { params = [] } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const spaceConfig = getSpace('mindlab');

  useEffect(() => { if (router.isReady) setLoading(false); }, [router.isReady]);

  if (loading || !router.isReady) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}><ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} /><h2>Mind Lab</h2><p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Please sign in to access Mind Lab.</p><Link href="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><LoginIcon fontSize="small" /> Sign In</Link></div></div>;
  if (!spaceConfig) return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}><ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--error)', marginBottom: 16 }} /><h2>Space Not Found</h2><p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Mind Lab space configuration is missing.</p></div></div>;

  const view = params[0] || spaceConfig.defaultView;
  if (!isValidView('mindlab', view)) return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}><ErrorOutlineIcon style={{ fontSize: 48, color: 'var(--error)', marginBottom: 16 }} /><h2>View Not Found</h2><p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The view "{view}" is not available in Mind Lab.</p><Link href="/app/thinking" className="btn btn-primary">Go to Mind Lab</Link></div></div>;

  return <MindLabProvider><MindLabWorkspace view={view} /></MindLabProvider>;
}
