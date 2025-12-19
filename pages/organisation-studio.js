/**
 * Organisation Studio Redirect
 * Redirects to new location: /app/workspaces/organisation
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OrganisationStudioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/workspaces/organisation');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
      <p style={{ color: 'var(--text-muted, #6b7280)' }}>Redirecting...</p>
    </div>
  );
}
