/**
 * DomainContext - Multi-tenant domain management
 *
 * Provides domain selection, creation, and sharing functionality.
 * Each user has a personal domain plus access to shared domains.
 * Domain context determines data isolation and access control.
 *
 * @module components/DomainContext
 *
 * @example
 * import { useDomains } from '../components/DomainContext';
 * const { activeDomain, accessibleDomains, setActiveDomain, isPersonalDomain } = useDomains();
 *
 * @typedef {Object} Domain
 * @property {string} id - Domain UUID
 * @property {string} displayId - Human-readable ID (DOM-0001)
 * @property {string} name - Domain name
 * @property {string} owner - Owner username
 * @property {string[]} [sharedWith] - Users with access
 * @property {string} [notes] - Domain description
 *
 * @typedef {Object} DomainContextValue
 * @property {Domain[]} domains - All domains (admin sees all)
 * @property {Domain[]} accessibleDomains - Domains user can access
 * @property {Domain|null} personalDomain - User's personal domain
 * @property {Domain[]} sharedDomains - Non-personal domains
 * @property {string|null} activeDomain - Currently selected domain ID
 * @property {Domain|null} activeDomainObj - Currently selected domain object
 * @property {boolean} isPersonalDomain - True if active is personal domain
 * @property {string|null} personalDomainId - Personal domain UUID
 * @property {Function} setActiveDomain - Switch active domain
 * @property {Function} addDomain - Create new domain
 * @property {Function} shareDomain - Share domain with user
 * @property {Function} removeShare - Remove user access
 * @property {Function} findByDisplayId - Find domain by display ID (DOM-0001)
 * @property {boolean} loading - Loading state
 * @property {string} error - Error message
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

/** @type {React.Context<DomainContextValue>} */
const DomainContext = createContext({
  domains: [],
  accessibleDomains: [],
  personalDomain: null,
  sharedDomains: [],
  activeDomain: null,
  activeDomainObj: null,
  isPersonalDomain: false,
  setActiveDomain: () => {},
  addDomain: () => {},
  shareDomain: () => {},
  removeShare: () => {},
  findByDisplayId: () => null,
  loading: false,
  error: '',
});

/**
 * DomainProvider - Provides domain context to the application
 *
 * Manages multi-tenant domain state, loads domains on user change,
 * and handles domain switching, creation, and sharing.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement}
 */
export function DomainProvider({ children }) {
  const { user, role, personalDomainId } = useAuth();
  const router = useRouter();
  const [domains, setDomains] = useState([]);
  const [activeDomain, setActiveDomainState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlDomainApplied, setUrlDomainApplied] = useState(false);

  // Filter accessible domains and mark personal domain
  const accessibleDomains = useMemo(() => {
    if (!user) return [];
    const accessible = role === 'admin'
      ? [...domains]
      : domains.filter(d => d.owner === user || (d.sharedWith || []).includes(user));

    // Sort so personal domain comes first (create a copy to avoid mutation)
    return accessible.slice().sort((a, b) => {
      if (a.id === personalDomainId) return -1;
      if (b.id === personalDomainId) return 1;
      return 0;
    });
  }, [domains, user, role, personalDomainId]);

  // Get personal domain object
  const personalDomain = useMemo(() => {
    return accessibleDomains.find(d => d.id === personalDomainId) || null;
  }, [accessibleDomains, personalDomainId]);

  // Get shared domains (all except personal)
  const sharedDomains = useMemo(() => {
    return accessibleDomains.filter(d => d.id !== personalDomainId);
  }, [accessibleDomains, personalDomainId]);

  // Check if current domain is the personal domain
  const isPersonalDomain = useMemo(() => {
    return activeDomain === personalDomainId;
  }, [activeDomain, personalDomainId]);

  const setActiveDomain = (id) => {
    if (!id) {
      if (accessibleDomains.length) setActiveDomainState(accessibleDomains[0].id);
      return;
    }
    setActiveDomainState(id);
    // Set cookie for middleware to use
    if (typeof document !== 'undefined') {
      document.cookie = `lastDomainId=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
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

  // Handle domain from URL query parameter (?dom=xxx) for shareable links
  // Supports both UUID format and display_id format (DOM-0001)
  useEffect(() => {
    if (!router.isReady || !accessibleDomains.length || urlDomainApplied) return;

    const domFromUrl = router.query.dom;
    if (domFromUrl && typeof domFromUrl === 'string') {
      let targetDomain = null;

      // Check if it's a display_id format (DOM-XXXX)
      if (/^DOM-\d{4}$/i.test(domFromUrl)) {
        targetDomain = accessibleDomains.find(d =>
          (d.displayId || d.display_id) === domFromUrl.toUpperCase()
        );
      } else {
        // Try UUID match
        targetDomain = accessibleDomains.find(d => d.id === domFromUrl);
      }

      if (targetDomain && targetDomain.id !== activeDomain) {
        setActiveDomainState(targetDomain.id);
        // Also update localStorage so it persists
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('kg-active-domain', targetDomain.id);
        }
      }
      setUrlDomainApplied(true);
    }
  }, [router.isReady, router.query.dom, accessibleDomains, activeDomain, urlDomainApplied]);

  // Reset URL domain applied flag when route changes
  useEffect(() => {
    setUrlDomainApplied(false);
  }, [router.pathname]);

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

  // Find domain by display ID (DOM-0001 format)
  // Handles both camelCase (displayId) and snake_case (display_id) from API
  function findByDisplayId(displayId) {
    if (!displayId) return null;
    return accessibleDomains.find(d =>
      d.displayId === displayId || d.display_id === displayId
    ) || null;
  }

  const value = useMemo(() => ({
    domains,
    accessibleDomains,
    personalDomain,
    sharedDomains,
    activeDomain,
    activeDomainObj: domains.find(d => d.id === activeDomain) || null,
    isPersonalDomain,
    personalDomainId,
    setActiveDomain,
    addDomain,
    shareDomain,
    removeShare,
    findByDisplayId,
    loading,
    error,
  }), [domains, accessibleDomains, personalDomain, sharedDomains, activeDomain, isPersonalDomain, personalDomainId, loading, error]);

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

/**
 * useDomains - Hook to access domain context
 *
 * @returns {DomainContextValue} Domain state and management functions
 *
 * @example
 * const { activeDomain, setActiveDomain, accessibleDomains } = useDomains();
 */
export function useDomains() {
  return useContext(DomainContext);
}
