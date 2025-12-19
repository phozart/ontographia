// components/ui/Navigator.js
// Shared Navigator sidebar component

import { useState } from 'react';
import styles from './ui.module.css';
import { Button } from './Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

/**
 * Navigator - Sidebar navigation component
 *
 * @param {string} title - Navigator title
 * @param {ReactNode} icon - Title icon component
 * @param {string} iconColor - Icon color
 * @param {boolean} showHome - Show home/overview button
 * @param {string} homeLabel - Label for home button
 * @param {boolean} homeActive - Is home active
 * @param {function} onHomeClick - Home button handler
 * @param {string} createLabel - Label for create button (null to hide)
 * @param {function} onCreate - Create button handler
 * @param {ReactNode} children - NavGroup components
 */
export function Navigator({
  title,
  icon: TitleIcon,
  iconColor = 'var(--module-teal)',
  showHome = true,
  homeLabel = 'Overview',
  homeIcon: HomeIconComponent = HomeIcon,
  homeActive = false,
  onHomeClick,
  createLabel,
  onCreate,
  children,
  className = '',
}) {
  return (
    <div className={`${styles.navigator} ${className}`.trim()}>
      {/* Header */}
      <div className={styles.navHeader}>
        <div className={styles.navHeaderTitle}>
          {TitleIcon && <TitleIcon style={{ color: iconColor, fontSize: 24 }} />}
          <span>{title}</span>
        </div>
      </div>

      {/* Home button */}
      {showHome && (
        <div className={styles.navHome}>
          <button
            className={`${styles.navHomeBtn} ${homeActive ? styles.active : ''}`.trim()}
            onClick={onHomeClick}
          >
            <HomeIconComponent fontSize="small" />
            <span>{homeLabel}</span>
          </button>
        </div>
      )}

      {/* Groups */}
      <div className={styles.navGroups}>
        {children}
      </div>

      {/* Footer with create button */}
      {createLabel && onCreate && (
        <div className={styles.navFooter}>
          <Button variant="primary" onClick={onCreate} style={{ width: '100%' }}>
            <AddIcon fontSize="small" />
            <span>{createLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * NavGroup - Collapsible group of navigation items
 */
export function NavGroup({
  name,
  count,
  defaultExpanded = true,
  hasActiveChild = false,
  children,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.navGroup}>
      <button
        className={`${styles.navGroupHeader} ${hasActiveChild ? styles.hasActive : ''}`.trim()}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ExpandMoreIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronRightIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
        )}
        <span className={styles.navGroupName}>{name}</span>
        {count !== undefined && (
          <span className={styles.navGroupCount}>{count}</span>
        )}
      </button>

      {expanded && (
        <div className={styles.navGroupItems}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * NavItem - Individual navigation item
 */
export function NavItem({
  icon: Icon,
  label,
  count,
  active = false,
  onClick,
  color,
}) {
  return (
    <button
      className={`${styles.navItem} ${active ? styles.active : ''}`.trim()}
      onClick={onClick}
    >
      {Icon && <Icon fontSize="small" style={color ? { color } : undefined} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={styles.navItemCount}>{count}</span>
      )}
    </button>
  );
}
