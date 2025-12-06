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
        sx={{ color: 'var(--text)' }}
      >
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
