// components/DomainScopedPage.js
// Wrapper component for domain-scoped pages

import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useDomains } from './DomainContext';

export default function DomainScopedPage({ children }) {
  const router = useRouter();
  const { domainId } = router.query;
  const { setActiveDomain, accessibleDomains } = useDomains();
  const hasSetDomain = useRef(false);

  // Set domain from URL on mount (only once)
  useEffect(() => {
    if (hasSetDomain.current || !domainId || accessibleDomains.length === 0) return;

    const domainExists = accessibleDomains.some(d => d.id === domainId);
    if (domainExists) {
      setActiveDomain(domainId);
      hasSetDomain.current = true;
    }
  }, [domainId, accessibleDomains, setActiveDomain]);

  return <>{children}</>;
}
