/**
 * PublicShare
 * Components for public read-only board sharing
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Share link types
 */
export const SHARE_LINK_TYPES = {
  VIEW: 'view',           // View-only access
  COMMENT: 'comment',     // Can add comments
  EMBED: 'embed',         // Embeddable version
  PRESENTATION: 'present', // Presentation mode
};

/**
 * Share link expiration options
 */
export const EXPIRATION_OPTIONS = {
  NEVER: null,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  CUSTOM: 'custom',
};

/**
 * Generate a unique share token
 */
function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a share link configuration
 */
export function createShareLink(boardId, options = {}) {
  const {
    type = SHARE_LINK_TYPES.VIEW,
    expiresIn = EXPIRATION_OPTIONS.NEVER,
    password = null,
    allowDownload = false,
    showComments = true,
    customSlug = null,
  } = options;

  const token = generateShareToken();
  const createdAt = new Date().toISOString();
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn).toISOString() : null;

  return {
    id: `share_${token.slice(0, 8)}`,
    boardId,
    token,
    type,
    slug: customSlug || token.slice(0, 12),
    password: password ? hashPassword(password) : null,
    hasPassword: !!password,
    allowDownload,
    showComments,
    createdAt,
    expiresAt,
    viewCount: 0,
    isActive: true,
  };
}

/**
 * Simple password hash (in production, use proper hashing)
 */
function hashPassword(password) {
  // In production, use bcrypt or similar
  return btoa(password);
}

/**
 * Validate password
 */
function validatePassword(input, hash) {
  return btoa(input) === hash;
}

/**
 * Public share context
 */
const PublicShareContext = createContext(null);

/**
 * Public share provider
 */
export function PublicShareProvider({ children, boardId }) {
  const [shareLinks, setShareLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load share links
  useEffect(() => {
    if (!boardId) return;

    const loadLinks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/boards/${boardId}/share-links`);
        if (response.ok) {
          const links = await response.json();
          setShareLinks(links);
        }
      } catch (error) {
        console.error('Failed to load share links:', error);
      }
      setIsLoading(false);
    };

    loadLinks();
  }, [boardId]);

  /**
   * Create a new share link
   */
  const createLink = useCallback(
    async (options = {}) => {
      const link = createShareLink(boardId, options);

      try {
        const response = await fetch(`/api/boards/${boardId}/share-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link),
        });

        if (response.ok) {
          const savedLink = await response.json();
          setShareLinks((prev) => [...prev, savedLink]);
          return savedLink;
        }
      } catch (error) {
        console.error('Failed to create share link:', error);
      }

      // Fallback to local-only
      setShareLinks((prev) => [...prev, link]);
      return link;
    },
    [boardId]
  );

  /**
   * Revoke a share link
   */
  const revokeLink = useCallback(
    async (linkId) => {
      try {
        await fetch(`/api/boards/${boardId}/share-links/${linkId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to revoke share link:', error);
      }

      setShareLinks((prev) => prev.filter((l) => l.id !== linkId));
    },
    [boardId]
  );

  /**
   * Update a share link
   */
  const updateLink = useCallback(
    async (linkId, updates) => {
      setShareLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, ...updates } : l))
      );

      try {
        await fetch(`/api/boards/${boardId}/share-links/${linkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Failed to update share link:', error);
      }
    },
    [boardId]
  );

  /**
   * Get share URL for a link
   */
  const getShareUrl = useCallback((link) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/share/${link.slug}`;
  }, []);

  /**
   * Get embed code for a link
   */
  const getEmbedCode = useCallback((link, options = {}) => {
    const { width = '100%', height = '600px' } = options;
    const url = getShareUrl(link) + '?embed=true';
    return `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
  }, [getShareUrl]);

  const contextValue = {
    shareLinks,
    isLoading,
    createLink,
    revokeLink,
    updateLink,
    getShareUrl,
    getEmbedCode,
  };

  return (
    <PublicShareContext.Provider value={contextValue}>
      {children}
    </PublicShareContext.Provider>
  );
}

/**
 * Hook to access public share context
 */
export function usePublicShare() {
  const context = useContext(PublicShareContext);
  if (!context) {
    throw new Error('usePublicShare must be used within a PublicShareProvider');
  }
  return context;
}

/**
 * Share link manager component
 */
export function ShareLinkManager({ boardId, className = '' }) {
  const {
    shareLinks,
    isLoading,
    createLink,
    revokeLink,
    getShareUrl,
    getEmbedCode,
  } = usePublicShare();

  const [showCreate, setShowCreate] = useState(false);
  const [newLinkType, setNewLinkType] = useState(SHARE_LINK_TYPES.VIEW);
  const [expiration, setExpiration] = useState(EXPIRATION_OPTIONS.NEVER);
  const [password, setPassword] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCreate = async () => {
    await createLink({
      type: newLinkType,
      expiresIn: expiration,
      password: password || null,
    });
    setShowCreate(false);
    setPassword('');
  };

  const copyToClipboard = async (link) => {
    const url = getShareUrl(link);
    await navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyEmbedCode = async (link) => {
    const code = getEmbedCode(link);
    await navigator.clipboard.writeText(code);
    setCopiedId(`embed_${link.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return <div className={className}>Loading share links...</div>;
  }

  return (
    <div className={`share-link-manager ${className}`}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px' }}>Public Share Links</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Create Link
        </button>
      </div>

      {/* Create new link form */}
      {showCreate && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
              Link Type
            </label>
            <select
              value={newLinkType}
              onChange={(e) => setNewLinkType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value={SHARE_LINK_TYPES.VIEW}>View Only</option>
              <option value={SHARE_LINK_TYPES.COMMENT}>View & Comment</option>
              <option value={SHARE_LINK_TYPES.EMBED}>Embeddable</option>
              <option value={SHARE_LINK_TYPES.PRESENTATION}>Presentation</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
              Expiration
            </label>
            <select
              value={expiration || ''}
              onChange={(e) => setExpiration(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="">Never</option>
              <option value={EXPIRATION_OPTIONS.ONE_DAY}>1 Day</option>
              <option value={EXPIRATION_OPTIONS.ONE_WEEK}>1 Week</option>
              <option value={EXPIRATION_OPTIONS.ONE_MONTH}>1 Month</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
              Password (optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreate}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Create Link
            </button>
            <button
              onClick={() => setShowCreate(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing links */}
      {shareLinks.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          No share links yet. Create one to share your board publicly.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shareLinks.map((link) => (
            <ShareLinkRow
              key={link.id}
              link={link}
              onCopy={() => copyToClipboard(link)}
              onCopyEmbed={() => copyEmbedCode(link)}
              onRevoke={() => revokeLink(link.id)}
              isCopied={copiedId === link.id}
              isEmbedCopied={copiedId === `embed_${link.id}`}
              shareUrl={getShareUrl(link)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual share link row
 */
function ShareLinkRow({
  link,
  onCopy,
  onCopyEmbed,
  onRevoke,
  isCopied,
  isEmbedCopied,
  shareUrl,
}) {
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  const typeLabels = {
    [SHARE_LINK_TYPES.VIEW]: 'View',
    [SHARE_LINK_TYPES.COMMENT]: 'Comment',
    [SHARE_LINK_TYPES.EMBED]: 'Embed',
    [SHARE_LINK_TYPES.PRESENTATION]: 'Present',
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: isExpired ? '#ffebee' : 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        opacity: isExpired ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                borderRadius: '4px',
              }}
            >
              {typeLabels[link.type] || link.type}
            </span>
            {link.hasPassword && (
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  backgroundColor: '#FFF3E0',
                  color: '#E65100',
                  borderRadius: '4px',
                }}
              >
                Password
              </span>
            )}
            {isExpired && (
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  backgroundColor: '#FFEBEE',
                  color: '#C62828',
                  borderRadius: '4px',
                }}
              >
                Expired
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#666',
              fontFamily: 'monospace',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {shareUrl}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Created {new Date(link.createdAt).toLocaleDateString()} • {link.viewCount || 0} views
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCopy}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: isCopied ? '#E8F5E9' : 'white',
              cursor: 'pointer',
            }}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          {link.type === SHARE_LINK_TYPES.EMBED && (
            <button
              onClick={onCopyEmbed}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: isEmbedCopied ? '#E8F5E9' : 'white',
                cursor: 'pointer',
              }}
            >
              {isEmbedCopied ? 'Copied!' : 'Embed'}
            </button>
          )}
          <button
            onClick={onRevoke}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #FFCDD2',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#C62828',
              cursor: 'pointer',
            }}
          >
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Password prompt for protected shares
 */
export function PasswordPrompt({ onSubmit, error }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Password Required</h2>
        <p style={{ margin: '0 0 24px 0', color: '#666' }}>
          This board is password protected. Enter the password to view.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
          autoFocus
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          View Board
        </button>
      </form>
    </div>
  );
}

/**
 * Read-only viewer wrapper
 */
export function PublicBoardViewer({
  board,
  shareLink,
  children,
  className = '',
}) {
  const isViewOnly = shareLink?.type === SHARE_LINK_TYPES.VIEW;
  const canComment = shareLink?.type === SHARE_LINK_TYPES.COMMENT;

  return (
    <div
      className={`public-board-viewer ${className}`}
      style={{ position: 'relative' }}
    >
      {/* Viewer banner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px 16px',
          backgroundColor: '#E3F2FD',
          borderBottom: '1px solid #BBDEFB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 500 }}>{board?.name || 'Shared Board'}</span>
          <span
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              backgroundColor: 'white',
              borderRadius: '4px',
              color: '#1976D2',
            }}
          >
            {isViewOnly ? 'View Only' : canComment ? 'Can Comment' : 'Public'}
          </span>
        </div>

        {shareLink?.allowDownload && (
          <button
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Download
          </button>
        )}
      </div>

      {/* Board content */}
      <div style={{ paddingTop: '44px' }}>{children}</div>
    </div>
  );
}

export { validatePassword };
export default ShareLinkManager;
