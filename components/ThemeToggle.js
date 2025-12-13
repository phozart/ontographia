import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  const Icon = theme === 'light' ? DarkModeIcon : LightModeIcon;

  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        onClick={() => onThemeChange(nextTheme)}
        aria-label={label}
        sx={{
          color: 'var(--text)',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          '&:hover': { background: 'var(--bg-hover)' }
        }}
      >
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
