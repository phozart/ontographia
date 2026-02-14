// components/ui/ControlsBar.js
// Shared controls bar with search, filters, and view toggles

import styles from './ui.module.css';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * ControlsBar - Container for search, filters, and view controls
 */
export function ControlsBar({ children, className = '' }) {
  return (
    <div className={`${styles.controlsBar} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * SearchBox - Search input with icon
 */
export function SearchBox({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  return (
    <div className={`${styles.searchBox} ${className}`.trim()}>
      <SearchIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * FilterSelect - Dropdown filter with icon
 */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Filter',
  className = '',
  showIcon = true,
}) {
  return (
    <div className={`${styles.filterSelect} ${className}`.trim()}>
      {showIcon && <FilterListIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * ViewToggle - Toggle between view modes (e.g., grid/list/timeline)
 */
export function ViewToggle({ value, options, onChange, className = '' }) {
  return (
    <div className={`${styles.viewToggle} ${className}`.trim()}>
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            className={value === opt.value ? styles.active : ''}
            onClick={() => onChange(opt.value)}
            title={opt.label}
          >
            {Icon ? <Icon fontSize="small" /> : opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * CheckboxFilter - Checkbox with label for boolean filters
 */
export function CheckboxFilter({ checked, onChange, label, className = '' }) {
  return (
    <label className={`${styles.checkboxLabel} ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
