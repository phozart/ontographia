import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const DomainContext = createContext({
  domains: [],
  activeDomain: null,
  setActiveDomain: () => {},
  addDomain: () => {},
  shareDomain: () => {},
  removeShare: () => {},
});

export function DomainProvider({ children }) {
  const { user, role } = useAuth();
  const [domains, setDomains] = useState([]);
  const [activeDomain, setActiveDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setDomains([]);
      setActiveDomain(null);
      return;
    }
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/domains', {
          headers: {
            'x-user': user || '',
            'x-role': role || '',
          },
        });
        if (!res.ok) throw new Error('Failed to load domains');
        const data = await res.json();
        setDomains(Array.isArray(data) ? data : []);
        const storedActive = typeof window !== 'undefined' ? window.localStorage.getItem('kg-active-domain') : null;
        const preferred = storedActive && data.find(d => d.id === storedActive);
        if (preferred) {
          setActiveDomain(preferred.id);
        } else if (data.length > 0) {
          setActiveDomain(data[0].id);
        } else {
          setActiveDomain(null);
        }
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
    if (activeDomain) {
      window.localStorage.setItem('kg-active-domain', activeDomain);
    } else {
      window.localStorage.removeItem('kg-active-domain');
    }
  }, [activeDomain]);

  const accessibleDomains = useMemo(() => {
    if (!user) return [];
    if (role === 'admin') return domains;
    return domains.filter(d => d.owner === user || (d.sharedWith || []).includes(user));
  }, [domains, user, role]);

  async function addDomain({ name, notes }) {
    if (!user || !name) return;
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user': user,
        'x-role': role || '',
      },
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
      headers: {
        'Content-Type': 'application/json',
        'x-user': user || '',
        'x-role': role || '',
      },
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
      headers: {
        'Content-Type': 'application/json',
        'x-user': user || '',
        'x-role': role || '',
      },
      body: JSON.stringify({ domainId: id, action: 'unshare', targetUser }),
    });
    if (!res.ok) throw new Error('Failed to remove access');
    const updated = await res.json();
    setDomains(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  }

  const value = useMemo(
    () => ({
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
    }),
    [domains, accessibleDomains, activeDomain, loading, error]
  );

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomains() {
  return useContext(DomainContext);
}
