import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';
import { SPACES, getSpacesByCategory } from '@/lib/spaceRegistry';
import NotificationBell from './shared/NotificationBell';

// Search icon component
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/**
 * SystemHeader - Top navigation bar for Ontographia
 *
 * Structure:
 * [Logo] | [Studio Switcher ▼] | [Domain/Project Context] ... [Settings] [Help] [User ▼]
 */
export default function SystemHeader({ theme, onThemeChange }) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeDomainObj, accessibleDomains, setActiveDomain } = useDomains();
  const [studioOpen, setStudioOpen] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [idSearchQuery, setIdSearchQuery] = useState('');
  const [idSearchResults, setIdSearchResults] = useState([]);
  const [idSearchLoading, setIdSearchLoading] = useState(false);
  const [idSearchOpen, setIdSearchOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [idSearchError, setIdSearchError] = useState('');
  const [idSearchFocused, setIdSearchFocused] = useState(false);
  const studioRef = useRef(null);
  const domainRef = useRef(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Determine current studio from URL
  const getCurrentStudio = () => {
    const path = router.pathname;

    // Check for /app/spaces/[space] pattern
    if (path.includes('/app/spaces/')) {
      const match = path.match(/\/app\/spaces\/([^\/]+)/);
      if (match && SPACES[match[1]]) {
        return SPACES[match[1]];
      }
    }

    // Check for legacy studio routes
    const studioMap = {
      '/ea-studio': 'ea',
      '/requirements-studio': 'ba',
      '/portfolio-studio': 'portfolio',
      '/product-design-workspace': 'pdw',
      '/dynamic-work-design': 'dwd',
      '/system-dynamics': 'sd',
      '/learning-studio': 'als',
      '/knowledge-studio': 'ks',
      '/graphnavigator': 'ks',
    };

    for (const [route, code] of Object.entries(studioMap)) {
      if (path.includes(route)) {
        return SPACES[code];
      }
    }

    return null;
  };

  const currentStudio = getCurrentStudio();
  const categories = getSpacesByCategory();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (studioRef.current && !studioRef.current.contains(e.target)) {
        setStudioOpen(false);
      }
      if (domainRef.current && !domainRef.current.contains(e.target)) {
        setDomainOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIdSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setStudioOpen(false);
    setDomainOpen(false);
    setUserOpen(false);
    setIdSearchOpen(false);
    setIdSearchQuery('');
  }, [router.pathname]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const handleDomainSelect = (domainId) => {
    setActiveDomain(domainId);
    setDomainOpen(false);
  };

  // Perform autocomplete search
  const performIdSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setIdSearchResults([]);
      setIdSearchOpen(false);
      return;
    }

    setIdSearchLoading(true);
    setIdSearchError('');

    try {
      const results = [];
      const searchTerm = query.toUpperCase();
      const domainId = activeDomainObj?.id;

      // Search domains
      if (searchTerm.startsWith('DOM') || searchTerm.length >= 2) {
        const matchingDomains = accessibleDomains?.filter(d => {
          const displayId = (d.display_id || d.displayId || '').toUpperCase();
          const name = (d.name || '').toUpperCase();
          return displayId.includes(searchTerm) || name.includes(searchTerm);
        }) || [];

        matchingDomains.slice(0, 3).forEach(d => {
          results.push({
            id: d.id,
            displayId: d.display_id || d.displayId || `DOM-${d.id}`,
            name: d.name,
            type: 'domain',
            typeLabel: 'Domain',
          });
        });
      }

      // Search initiatives (via API)
      if ((searchTerm.startsWith('INI') || searchTerm.startsWith('BPS') || searchTerm.length >= 3) && domainId) {
        try {
          const res = await fetch(`/api/blueprint/initiatives?domainId=${domainId}&search=${encodeURIComponent(query)}&limit=5`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            (data.initiatives || data || []).slice(0, 5).forEach(ini => {
              results.push({
                id: ini.id,
                displayId: ini.display_id || ini.displayId || ini.initiative_id || `INI-${ini.id}`,
                name: ini.name || ini.title,
                type: 'initiative',
                typeLabel: 'Initiative',
                stage: ini.stage,
              });
            });
          }
        } catch (e) {
          console.warn('Initiative search failed:', e);
        }
      }

      // Search product ideas (via API)
      if ((searchTerm.startsWith('PI') || searchTerm.length >= 3) && domainId) {
        try {
          const res = await fetch(`/api/blueprint/product-ideas?domainId=${domainId}&search=${encodeURIComponent(query)}&limit=5`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            (data.productIdeas || data || []).slice(0, 5).forEach(pi => {
              results.push({
                id: pi.id,
                displayId: pi.display_id || pi.displayId || pi.product_idea_id || `PI-${pi.id}`,
                name: pi.name || pi.title || pi.description?.substring(0, 50),
                type: 'productIdea',
                typeLabel: 'Product Idea',
                stage: pi.stage,
                initiativeId: pi.initiative_id,
                initiativeDisplayId: pi.initiative_display_id,
              });
            });
          }
        } catch (e) {
          console.warn('Product idea search failed:', e);
        }
      }

      setIdSearchResults(results);
      setIdSearchOpen(results.length > 0);
      setSelectedResultIndex(-1);
    } catch (err) {
      console.error('ID search error:', err);
      setIdSearchError('Search failed');
    } finally {
      setIdSearchLoading(false);
    }
  }, [activeDomainObj, accessibleDomains]);

  // Debounced search on input change
  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value.toUpperCase();
    setIdSearchQuery(value);
    setIdSearchError('');

    // Clear previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Debounce the search
    searchDebounceRef.current = setTimeout(() => {
      performIdSearch(value);
    }, 200);
  }, [performIdSearch]);

  // Navigate to selected result
  const navigateToResult = useCallback((result) => {
    const domainDisplayId = activeDomainObj?.display_id || activeDomainObj?.displayId;

    if (result.type === 'domain') {
      setActiveDomain(result.id);
      router.push(`/app/spaces/blueprint/overview/${result.displayId}`);
    } else if (result.type === 'initiative') {
      if (domainDisplayId) {
        router.push(`/app/spaces/blueprint/discovery/${domainDisplayId}/${result.displayId}`);
      }
    } else if (result.type === 'productIdea') {
      if (domainDisplayId && result.initiativeDisplayId) {
        router.push(`/app/spaces/blueprint/discovery/${domainDisplayId}/${result.initiativeDisplayId}?idea=${result.displayId}`);
      } else if (domainDisplayId) {
        router.push(`/app/spaces/blueprint/ideas/${domainDisplayId}?idea=${result.displayId}`);
      }
    }

    setIdSearchQuery('');
    setIdSearchResults([]);
    setIdSearchOpen(false);
  }, [activeDomainObj, setActiveDomain, router]);

  // Handle keyboard navigation in results
  const handleSearchKeyDown = useCallback((e) => {
    if (!idSearchOpen || idSearchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev =>
        prev < idSearchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev =>
        prev > 0 ? prev - 1 : idSearchResults.length - 1
      );
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      navigateToResult(idSearchResults[selectedResultIndex]);
    } else if (e.key === 'Escape') {
      setIdSearchOpen(false);
    }
  }, [idSearchOpen, idSearchResults, selectedResultIndex, navigateToResult]);

  // Handle form submit (for direct ID entry)
  const handleIdSearch = useCallback(async (e) => {
    e.preventDefault();

    // If there's a selected result, navigate to it
    if (selectedResultIndex >= 0 && idSearchResults[selectedResultIndex]) {
      navigateToResult(idSearchResults[selectedResultIndex]);
      return;
    }

    // If there's exactly one result, navigate to it
    if (idSearchResults.length === 1) {
      navigateToResult(idSearchResults[0]);
      return;
    }

    // Otherwise try direct navigation
    const query = idSearchQuery.trim().toUpperCase();
    if (!query) return;

    const domainDisplayId = activeDomainObj?.display_id || activeDomainObj?.displayId;

    if (query.startsWith('DOM-')) {
      const domain = accessibleDomains?.find(d =>
        (d.display_id || d.displayId)?.toUpperCase() === query
      );
      if (domain) {
        setActiveDomain(domain.id);
        router.push(`/app/spaces/blueprint/overview/${query}`);
        setIdSearchQuery('');
      } else {
        setIdSearchError('Domain not found');
      }
    } else if (query.startsWith('INI-') || query.startsWith('BPS-')) {
      if (domainDisplayId) {
        router.push(`/app/spaces/blueprint/discovery/${domainDisplayId}/${query}`);
        setIdSearchQuery('');
      } else {
        setIdSearchError('Select a domain first');
      }
    } else {
      setIdSearchError('Enter a valid ID (PI-, INI-, DOM-)');
    }
  }, [idSearchQuery, activeDomainObj, accessibleDomains, setActiveDomain, router, selectedResultIndex, idSearchResults, navigateToResult]);

  const navigateToStudio = (code) => {
    const space = SPACES[code];
    if (space) {
      // Handle custom URLs for spaces with non-standard routing
      if (space.customUrl) {
        router.push(space.customUrl);
      } else {
        router.push(`/app/spaces/${code}/${space.defaultView}`);
      }
      setStudioOpen(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="system-header">
      {/* Left: Logo + Studio Switcher */}
      <div className="system-header-left">
        {/* Logo */}
        <Link href="/" className="system-header-brand">
          <img src="/icons/icon.svg" alt="" className="system-header-logo-icon" />
          <span className="system-header-logo">ONTOGRAPHIA</span>
        </Link>

        <span className="system-header-divider" />

        {/* Studio Switcher */}
        <div className="studio-switcher-wrap" ref={studioRef}>
          <button
            className="studio-switcher"
            onClick={() => setStudioOpen(!studioOpen)}
            data-open={studioOpen}
            aria-expanded={studioOpen}
            aria-haspopup="menu"
          >
            <span>{currentStudio?.name || 'Select Studio'}</span>
            <svg className="studio-switcher-icon" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {studioOpen && (
            <div className="studio-dropdown" role="menu">
              {Object.entries(categories).map(([category, codes]) => {
                const validCodes = codes.filter(code => SPACES[code]);
                if (validCodes.length === 0) return null;

                return (
                  <div key={category} className="studio-category-column">
                    <span className="studio-category-label">{category}</span>
                    {validCodes.map(code => {
                      const space = SPACES[code];
                      const isActive = currentStudio?.code === code;
                      return (
                        <button
                          key={code}
                          className={`studio-option ${isActive ? 'active' : ''}`}
                          onClick={() => navigateToStudio(code)}
                          role="menuitem"
                        >
                          <span>{space.name}</span>
                          {isActive && (
                            <svg className="check-icon" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Domain Selector */}
        <span className="system-header-divider" />
        <div className="domain-switcher-wrap" ref={domainRef}>
          <button
            className="domain-switcher"
            onClick={() => setDomainOpen(!domainOpen)}
            data-open={domainOpen}
            aria-expanded={domainOpen}
            aria-haspopup="menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{activeDomainObj?.name || 'Select Domain'}</span>
            <svg className="domain-switcher-icon" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {domainOpen && (
            <div className="domain-dropdown" role="menu">
              <div className="domain-dropdown-header">
                <span className="domain-dropdown-label">Domains</span>
              </div>
              {accessibleDomains && accessibleDomains.length > 0 ? (
                accessibleDomains.map(domain => {
                  const isActive = activeDomainObj?.id === domain.id;
                  return (
                    <button
                      key={domain.id}
                      className={`domain-option ${isActive ? 'active' : ''}`}
                      onClick={() => handleDomainSelect(domain.id)}
                      role="menuitem"
                    >
                      <span className="domain-option-name">{domain.name}</span>
                      {domain.displayId && (
                        <span className="domain-option-id">{domain.displayId}</span>
                      )}
                      {isActive && (
                        <svg className="check-icon" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="domain-dropdown-empty">No domains available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="system-header-right">
        {/* ID Search with Autocomplete */}
        <div className="system-header-search-wrap" ref={searchRef}>
          <form
            className={`system-header-search ${idSearchFocused ? 'focused' : ''} ${idSearchError ? 'error' : ''}`}
            onSubmit={handleIdSearch}
          >
            <SearchIcon />
            <input
              type="text"
              className="system-header-search-input"
              placeholder="Go to ID..."
              value={idSearchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                setIdSearchFocused(true);
                if (idSearchResults.length > 0) setIdSearchOpen(true);
              }}
              onBlur={() => setIdSearchFocused(false)}
            />
            {idSearchLoading && (
              <span className="system-header-search-spinner" />
            )}
            {idSearchQuery && !idSearchLoading && (
              <button
                type="button"
                className="system-header-search-clear"
                onClick={() => {
                  setIdSearchQuery('');
                  setIdSearchError('');
                  setIdSearchResults([]);
                  setIdSearchOpen(false);
                }}
              >
                <ClearIcon />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {idSearchOpen && idSearchResults.length > 0 && (
            <div className="system-header-search-dropdown">
              {idSearchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  className={`system-header-search-result ${index === selectedResultIndex ? 'selected' : ''}`}
                  onClick={() => navigateToResult(result)}
                  onMouseEnter={() => setSelectedResultIndex(index)}
                >
                  <span className={`search-result-type search-result-type-${result.type}`}>
                    {result.typeLabel}
                  </span>
                  <span className="search-result-id">{result.displayId}</span>
                  <span className="search-result-name">{result.name}</span>
                  {result.stage && (
                    <span className={`search-result-stage search-result-stage-${result.stage}`}>
                      {result.stage}
                    </span>
                  )}
                </button>
              ))}
              <div className="system-header-search-hint">
                <kbd>↑</kbd><kbd>↓</kbd> navigate &middot; <kbd>Enter</kbd> select &middot; <kbd>Esc</kbd> close
              </div>
            </div>
          )}

          {/* Error Display */}
          {idSearchError && (
            <div className="system-header-search-error-dropdown">
              {idSearchError}
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Settings */}
        <button
          className="system-header-icon-btn"
          title="Settings"
          onClick={() => router.push('/user/settings')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Help */}
        <button
          className="system-header-icon-btn"
          title="Help"
          onClick={() => router.push('/help')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>

        {/* User Menu */}
        <div className="user-menu-wrap" ref={userRef}>
          <button
            className="system-header-user-btn"
            onClick={() => setUserOpen(!userOpen)}
            aria-expanded={userOpen}
            aria-haspopup="menu"
          >
            <span className="user-avatar-small">{getUserInitials()}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4"/>
            </svg>
          </button>

          {userOpen && (
            <div className="user-menu-dropdown" role="menu">
              {/* User Header */}
              <div className="user-menu-header">
                <span className="user-avatar-medium">{getUserInitials()}</span>
                <div className="user-menu-info">
                  <span className="user-menu-name">{user?.name || 'Guest'}</span>
                  <span className="user-menu-email">{user?.email || ''}</span>
                </div>
              </div>

              {/* Profile Section */}
              <span className="user-menu-section-label">Profile</span>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); router.push('/user/profile'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile & Preferences
              </button>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); router.push('/user/settings'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>

              <div className="user-menu-divider" />

              {/* Admin Section */}
              <span className="user-menu-section-label">Admin</span>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); router.push('/admin/style-guide'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Style Guide
              </button>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); router.push('/admin/menu-config'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                Menu Configuration
              </button>

              <div className="user-menu-divider" />

              {/* Help Section */}
              <span className="user-menu-section-label">Help</span>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); router.push('/help'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Help Center
              </button>
              <button className="user-menu-item" onClick={() => { setUserOpen(false); window.open('https://github.com/your-repo/ontographia', '_blank'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Documentation
              </button>

              <div className="user-menu-divider" />

              {/* Sign Out */}
              <button className="user-menu-item user-menu-signout" onClick={() => { setUserOpen(false); router.push('/api/auth/logout'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
