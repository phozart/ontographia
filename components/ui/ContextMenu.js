// components/ui/ContextMenu.js
// Right-click context menu component

import { useState, useEffect, useCallback, useRef } from 'react';

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Close on click outside or scroll
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, closeContextMenu]);

  return { contextMenu, handleContextMenu, closeContextMenu };
}

export function ContextMenu({ x, y, onClose, children }) {
  const menuRef = useRef(null);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = x + rect.width > window.innerWidth ? x - rect.width : x;
      const adjustedY = y + rect.height > window.innerHeight ? y - rect.height : y;

      menuRef.current.style.left = `${Math.max(8, adjustedX)}px`;
      menuRef.current.style.top = `${Math.max(8, adjustedY)}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        minWidth: 160,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        zIndex: 10000,
        overflow: 'hidden',
        padding: '4px 0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

ContextMenu.Item = function ContextMenuItem({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}) {
  const variantStyles = {
    default: {
      color: 'var(--text-primary)',
      hoverBg: 'var(--bg-secondary)',
    },
    danger: {
      color: '#ef4444',
      hoverBg: '#fef2f2',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: 400,
        color: disabled ? 'var(--text-muted)' : styles.color,
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = styles.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {Icon && <Icon style={{ fontSize: 18 }} />}
      {label}
    </button>
  );
};

ContextMenu.Divider = function ContextMenuDivider() {
  return (
    <div style={{
      height: 1,
      backgroundColor: 'var(--border)',
      margin: '4px 0',
    }} />
  );
};
