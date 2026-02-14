/**
 * ConnectionStatus Component
 * Displays the current connection status for collaboration
 */

import React from 'react';
import { useConnectionStatus } from '../hooks/useCollaboration.js';

/**
 * Status dot indicator
 */
function StatusDot({ status }) {
  const colors = {
    connected: '#10b981',    // green
    connecting: '#f59e0b',   // yellow
    disconnected: '#ef4444', // red
    error: '#ef4444',        // red
    syncing: '#3b82f6',      // blue
  };

  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colors[status] || colors.disconnected,
    animation: status === 'connecting' || status === 'syncing' ? 'pulse 1.5s infinite' : 'none',
  };

  return <div style={dotStyle} />;
}

/**
 * Connection status indicator
 */
export function ConnectionStatus({
  showLabel = true,
  showDetails = false,
  compact = false,
}) {
  const {
    isConnected,
    isSyncing,
    pendingChanges,
    lastSyncedAt,
    error,
  } = useConnectionStatus();

  const status = React.useMemo(() => {
    if (error) return 'error';
    if (!isConnected) return 'disconnected';
    if (isSyncing) return 'syncing';
    return 'connected';
  }, [isConnected, isSyncing, error]);

  const statusText = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Offline',
    error: 'Connection Error',
    syncing: 'Syncing...',
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 4 : 8,
    padding: compact ? '4px 8px' : '6px 12px',
    borderRadius: 6,
    backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'transparent',
    cursor: 'default',
  };

  const labelStyle = {
    fontSize: compact ? 12 : 14,
    color: error ? '#ef4444' : '#6b7280',
    fontWeight: 500,
  };

  const detailsStyle = {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 8,
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div style={containerStyle} title={error || statusText[status]}>
      <StatusDot status={status} />
      {showLabel && (
        <span style={labelStyle}>{statusText[status]}</span>
      )}
      {showDetails && isConnected && (
        <span style={detailsStyle}>
          {pendingChanges > 0 && `${pendingChanges} pending • `}
          Last sync: {formatLastSync(lastSyncedAt)}
        </span>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

/**
 * Reconnect button
 */
export function ReconnectButton({ variant = 'text' }) {
  const { isConnected, error, connect } = useConnectionStatus();
  const [isReconnecting, setIsReconnecting] = React.useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await connect();
    } finally {
      setIsReconnecting(false);
    }
  };

  if (isConnected) {
    return null;
  }

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: variant === 'text' ? '4px 8px' : '8px 16px',
    borderRadius: 6,
    border: variant === 'text' ? 'none' : '1px solid #e5e7eb',
    backgroundColor: variant === 'text' ? 'transparent' : '#ffffff',
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 500,
    cursor: isReconnecting ? 'wait' : 'pointer',
    opacity: isReconnecting ? 0.7 : 1,
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleReconnect}
      disabled={isReconnecting}
    >
      {isReconnecting ? (
        <>
          <span style={{ animation: 'spin 1s linear infinite' }}>↻</span>
          Reconnecting...
        </>
      ) : (
        <>
          ↻ Reconnect
        </>
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
}

/**
 * Offline banner
 */
export function OfflineBanner() {
  const { isConnected, error } = useConnectionStatus();

  if (isConnected) {
    return null;
  }

  const bannerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '12px 24px',
    backgroundColor: error ? '#fef2f2' : '#fef9c3',
    borderBottom: `1px solid ${error ? '#fecaca' : '#fde68a'}`,
    color: error ? '#991b1b' : '#92400e',
    fontSize: 14,
  };

  const iconStyle = {
    fontSize: 18,
  };

  return (
    <div style={bannerStyle}>
      <span style={iconStyle}>{error ? '⚠️' : '📶'}</span>
      <span>
        {error
          ? 'Connection lost. Your changes are saved locally.'
          : 'You\'re offline. Changes will sync when connected.'}
      </span>
      <ReconnectButton />
    </div>
  );
}

/**
 * Sync status indicator (for footer/status bar)
 */
export function SyncStatus() {
  const { isConnected, isSyncing, pendingChanges, lastSyncedAt } = useConnectionStatus();

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#9ca3af',
  };

  const iconStyle = {
    fontSize: 14,
    animation: isSyncing ? 'spin 1s linear infinite' : 'none',
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <span style={{ color: '#ef4444' }}>●</span>
        Offline
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span style={iconStyle}>{isSyncing ? '↻' : '☁️'}</span>
      {isSyncing ? (
        'Syncing...'
      ) : pendingChanges > 0 ? (
        `${pendingChanges} unsaved changes`
      ) : lastSyncedAt ? (
        `Saved at ${formatTime(lastSyncedAt)}`
      ) : (
        'All changes saved'
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ConnectionStatus;
