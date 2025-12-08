import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const DomainContext = createContext({
  domains: [],
  activeDomain: null,
  setActiveDomain: () => {},
  addDomain: () => {},
  shareDomain: () => {},
  removeShare: () => {},
  loading: false,
  error: '',
});

export function DomainProvider({ children }) {
  const { user, role } = useAuth();
  const [domains, setDomains] = useState([]);
  const [activeDomain, setActiveDomainState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accessibleDomains = useMemo(() => {
    if (!user) return [];
    if (role === 'admin') return domains;
    return domains.filter(d => d.owner === user || (d.sharedWith || []).includes(user));
  }, [domains, user, role]);

  const setActiveDomain = (id) => {
    if (!id) {
      if (accessibleDomains.length) setActiveDomainState(accessibleDomains[0].id);
      return;
    }
    setActiveDomainState(id);
  };

  useEffect(() => {
    if (!user) {
      setDomains([]);
      setActiveDomainState(null);
      return;
    }
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/domains', {
          headers: { 'x-user': user || '', 'x-role': role || '' },
        });
        if (!res.ok) throw new Error('Failed to load domains');
        const data = await res.json();
        const nextDomains = Array.isArray(data) ? data : [];
        setDomains(nextDomains);
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('kg-active-domain') : null;
        const preferred = stored && nextDomains.find(d => d.id === stored);
        const fallback = nextDomains[0];
        setActiveDomainState(preferred ? preferred.id : fallback ? fallback.id : null);
      } catch (e) {
        setError(e.message || 'Failed to load domains');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, role]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeDomain) window.localStorage.setItem('kg-active-domain', activeDomain);
  }, [activeDomain]);

  useEffect(() => {
    if (!accessibleDomains.length) {
      setActiveDomainState(null);
      return;
    }
    const stillValid = accessibleDomains.find(d => d.id === activeDomain);
    if (!stillValid) setActiveDomainState(accessibleDomains[0].id);
  }, [accessibleDomains, activeDomain]);

  async function addDomain({ name, notes }) {
    if (!user || !name) return;
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role || '' },
      body: JSON.stringify({ name, notes }),
    });
    if (!res.ok) throw new Error('Failed to create domain');
    const domain = await res.json();
    setDomains(prev => [domain, ...prev]);
    setActiveDomain(domain.id);
  }

  async function shareDomain(id, targetUser, shareRole = 'viewer') {
    if (!id || !targetUser) return;
    const res = await fetch('/api/domains', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user': user || '', 'x-role': role || '' },
      body: JSON.stringify({ domainId: id, action: 'share', targetUser, targetRole: shareRole }),
    });
    if (!res.ok) throw new Error('Failed to share domain');
    const updated = await res.json();
    setDomains(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  }

  async function removeShare(id, targetUser) {
    if (!id || !targetUser) return;
    const res = await fetch('/api/domains', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user': user || '', 'x-role': role || '' },
      body: JSON.stringify({ domainId: id, action: 'unshare', targetUser }),
    });
    if (!res.ok) throw new Error('Failed to remove access');
    const updated = await res.json();
    setDomains(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  }

  const value = useMemo(() => ({
    domains,
    accessibleDomains,
    activeDomain,
    activeDomainObj: domains.find(d => d.id === activeDomain) || null,
    setActiveDomain,
    addDomain,
    shareDomain,
    removeShare,
    loading,
    error,
  }), [domains, accessibleDomains, activeDomain, loading, error]);

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomains() {
  return useContext(DomainContext);
}
