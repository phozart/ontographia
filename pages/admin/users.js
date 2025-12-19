import { useEffect, useMemo, useState, useCallback } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box, Button, MenuItem, Select, TextField, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox, FormControlLabel, Chip, Tabs, Tab,
  IconButton, Tooltip, Stepper, Step, StepLabel, Alert, LinearProgress,
  InputAdornment
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../../components/AuthContext';
import { LogoSpinner } from '../../components/Logo';

// Password validation helper
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
};

function validatePassword(password) {
  const errors = [];
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('At least one number');
  }
  return errors;
}

// Role definitions
const ROLE_DEFINITIONS = {
  admin: {
    name: 'Admin',
    description: 'Full access to everything. Only for app owners.',
    color: '#ef4444',
    capabilities: [
      'Manage all users and permissions',
      'Access all domains and pages',
      'Configure system settings',
      'Delete any content',
    ],
  },
  editor: {
    name: 'Editor',
    description: 'Can create and edit content in assigned areas.',
    color: '#f59e0b',
    capabilities: [
      'Create and update content',
      'View assigned domains',
      'Export reports',
      'Cannot manage users',
    ],
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to assigned areas.',
    color: '#3b82f6',
    capabilities: [
      'View content in assigned domains',
      'Export reports (read-only)',
      'Cannot create or edit content',
      'Cannot manage settings',
    ],
  },
};

// Step-by-step User Creation Wizard
function CreateUserWizard({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    selectedDomains: [],
    selectedPages: [],
  });

  // Data for selections
  const [domains, setDomains] = useState([]);
  const [pages, setPages] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const steps = ['Account Details', 'Select Role', 'Domain Access', 'Page Permissions', 'Review & Create'];

  // Load domains and pages when wizard opens
  useEffect(() => {
    if (open) {
      loadSelectionData();
    }
  }, [open]);

  async function loadSelectionData() {
    setLoadingData(true);
    try {
      const [domainsRes, pagesRes] = await Promise.all([
        fetch('/api/domains'),
        fetch('/api/admin/page-registry'),
      ]);

      if (domainsRes.ok) {
        const domainsData = await domainsRes.json();
        setDomains(domainsData);
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }
    } catch (err) {
      console.error('Error loading selection data:', err);
    } finally {
      setLoadingData(false);
    }
  }

  // Validation for each step
  const passwordErrors = validatePassword(formData.password);
  const isPasswordValid = passwordErrors.length === 0;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const canProceed = () => {
    switch (activeStep) {
      case 0: // Account Details
        return formData.username.length >= 3 && isPasswordValid && passwordsMatch;
      case 1: // Role
        return !!formData.role;
      case 2: // Domains
        return true; // Optional
      case 3: // Pages
        return true; // Optional
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreate();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');

    try {
      // Create user
      const createRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create user');
      }

      const newUser = await createRes.json();

      // Set domain access if domains selected
      if (formData.selectedDomains.length > 0) {
        await fetch('/api/domains/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: newUser.id,
            domainIds: formData.selectedDomains,
          }),
        });
      }

      // Set page permissions if pages selected
      if (formData.selectedPages.length > 0) {
        await fetch('/api/admin/page-permissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: newUser.id,
            permissions: formData.selectedPages.map(path => ({ page_path: path, can_access: true })),
            granted_by: 'admin',
          }),
        });
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'viewer',
      selectedDomains: [],
      selectedPages: [],
    });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCopiedPassword(false);
    onClose();
  };

  const toggleDomain = (domainId) => {
    setFormData(prev => ({
      ...prev,
      selectedDomains: prev.selectedDomains.includes(domainId)
        ? prev.selectedDomains.filter(id => id !== domainId)
        : [...prev.selectedDomains, domainId],
    }));
  };

  const togglePage = (pagePath) => {
    setFormData(prev => ({
      ...prev,
      selectedPages: prev.selectedPages.includes(pagePath)
        ? prev.selectedPages.filter(p => p !== pagePath)
        : [...prev.selectedPages, pagePath],
    }));
  };

  // Group pages by category
  const pagesByCategory = useMemo(() => {
    const grouped = {};
    for (const page of pages) {
      if (!grouped[page.category]) {
        grouped[page.category] = [];
      }
      grouped[page.category].push(page);
    }
    return grouped;
  }, [pages]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Account Details
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Create User Account</Typography>
            <Typography color="text.secondary">
              Enter the basic account information for the new user.
            </Typography>

            <TextField
              label="Username"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              fullWidth
              helperText="Minimum 3 characters"
              error={formData.username.length > 0 && formData.username.length < 3}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              fullWidth
              error={formData.password.length > 0 && !isPasswordValid}
              helperText={
                formData.password.length > 0 && !isPasswordValid
                  ? `Missing: ${passwordErrors.join(', ')}`
                  : 'Min 8 characters, 1 uppercase, 1 number'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              fullWidth
              error={formData.confirmPassword.length > 0 && !passwordsMatch}
              helperText={formData.confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {formData.username && isPasswordValid && passwordsMatch && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Account details are valid!
              </Alert>
            )}
          </Box>
        );

      case 1: // Role Selection
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Select User Role</Typography>
            <Typography color="text.secondary">
              Choose the appropriate access level for this user.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(ROLE_DEFINITIONS).map(([key, role]) => (
                <Box
                  key={key}
                  onClick={() => setFormData(prev => ({ ...prev, role: key }))}
                  sx={{
                    p: 2,
                    border: 2,
                    borderColor: formData.role === key ? role.color : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: formData.role === key ? `${role.color}10` : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: role.color },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={role.name}
                      sx={{ bgcolor: role.color, color: 'white', fontWeight: 600 }}
                    />
                    {formData.role === key && <CheckCircleIcon sx={{ color: role.color }} />}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>{role.description}</Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {role.capabilities.map((cap, i) => (
                      <Typography component="li" key={i} variant="body2" color="text.secondary">
                        {cap}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {formData.role === 'admin' && (
              <Alert severity="warning">
                Admin access should only be given to app owners. Admins have full system access.
              </Alert>
            )}
          </Box>
        );

      case 2: // Domain Access
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Domain Access</Typography>
            <Typography color="text.secondary">
              Select which domains this user can access. Leave empty to grant access later.
            </Typography>

            {loadingData ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LogoSpinner label="Loading domains..." />
              </Box>
            ) : domains.length === 0 ? (
              <Alert severity="info">No domains available. You can assign domains later.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {domains.map(domain => (
                  <FormControlLabel
                    key={domain.id}
                    control={
                      <Checkbox
                        checked={formData.selectedDomains.includes(domain.id)}
                        onChange={() => toggleDomain(domain.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{domain.name}</Typography>
                        {domain.description && (
                          <Typography variant="caption" color="text.secondary">
                            {domain.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Selected: {formData.selectedDomains.length} domain(s)
            </Typography>
          </Box>
        );

      case 3: // Page Permissions
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Page Permissions</Typography>
            <Typography color="text.secondary">
              Select additional pages this user can access beyond their role defaults.
            </Typography>

            {loadingData ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LogoSpinner label="Loading pages..." />
              </Box>
            ) : pages.length === 0 ? (
              <Alert severity="info">No pages configured. You can set permissions later.</Alert>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {Object.entries(pagesByCategory).map(([category, categoryPages]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1 }}>
                      {categoryPages.map(page => (
                        <FormControlLabel
                          key={page.path}
                          control={
                            <Checkbox
                              size="small"
                              checked={formData.selectedPages.includes(page.path)}
                              onChange={() => togglePage(page.path)}
                            />
                          }
                          label={
                            <Typography variant="body2">{page.name}</Typography>
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Selected: {formData.selectedPages.length} page(s) (in addition to role defaults)
            </Typography>
          </Box>
        );

      case 4: // Review
        const selectedRole = ROLE_DEFINITIONS[formData.role];
        const handleCopyPassword = () => {
          navigator.clipboard.writeText(formData.password);
          setCopiedPassword(true);
          setTimeout(() => setCopiedPassword(false), 2000);
        };
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Review & Create User</Typography>
            <Typography color="text.secondary">
              Please review the user details before creating the account.
            </Typography>

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Username</Typography>
                  <Typography variant="body1" fontWeight={600}>{formData.username}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Password</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.9rem',
                      }}
                    >
                      {formData.password}
                    </Box>
                    <Tooltip title={copiedPassword ? 'Copied!' : 'Copy password'}>
                      <IconButton size="small" onClick={handleCopyPassword}>
                        <ContentCopyIcon fontSize="small" color={copiedPassword ? 'success' : 'inherit'} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Make sure to save or share this password securely with the user.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={selectedRole.name}
                      size="small"
                      sx={{ bgcolor: selectedRole.color, color: 'white' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedRole.description}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Domain Access</Typography>
                  <Typography variant="body1">
                    {formData.selectedDomains.length === 0
                      ? 'No domains selected (can be assigned later)'
                      : `${formData.selectedDomains.length} domain(s) selected`}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Additional Pages</Typography>
                  <Typography variant="body1">
                    {formData.selectedPages.length === 0
                      ? 'Using role defaults'
                      : `${formData.selectedPages.length} additional page(s)`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon />
          Create New User
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {saving && <LinearProgress sx={{ mb: 2 }} />}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={saving}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canProceed() || saving}
        >
          {activeStep === steps.length - 1 ? (saving ? 'Creating...' : 'Create User') : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Permission Management Modal
function PermissionModal({ open, onClose, user, onSave }) {
  const [pages, setPages] = useState([]);
  const [userPerms, setUserPerms] = useState({ pages: [], allPages: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  // Fetch page registry and user permissions
  useEffect(() => {
    if (!open || !user) return;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch all pages
        const pagesRes = await fetch('/api/admin/page-registry');
        const pagesData = await pagesRes.json();
        setPages(pagesData);

        // Fetch user permissions
        const permsRes = await fetch(`/api/admin/page-permissions?userId=${user.id}`);
        const permsData = await permsRes.json();
        setUserPerms(permsData);
        setChanges({});
      } catch (err) {
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [open, user]);

  // Group pages by category
  const pagesByCategory = useMemo(() => {
    const grouped = {};
    for (const page of pages) {
      if (!grouped[page.category]) {
        grouped[page.category] = [];
      }
      grouped[page.category].push(page);
    }
    return grouped;
  }, [pages]);

  const categories = Object.keys(pagesByCategory);

  // Check if a page is currently accessible
  const isPageAccessible = useCallback((pagePath) => {
    // Check if there's a pending change
    if (changes[pagePath] !== undefined) {
      return changes[pagePath];
    }
    // Check current permissions
    const pageInfo = userPerms.allPages?.find(p => p.path === pagePath);
    return pageInfo?.can_access || false;
  }, [changes, userPerms.allPages]);

  // Check if a page's access is from role default or explicit grant
  const getAccessType = useCallback((pagePath) => {
    const pageInfo = userPerms.allPages?.find(p => p.path === pagePath);
    return pageInfo?.grant_type || 'default';
  }, [userPerms.allPages]);

  // Toggle page access
  const toggleAccess = (pagePath, currentAccess) => {
    setChanges(prev => ({
      ...prev,
      [pagePath]: !currentAccess
    }));
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // Build permissions array from changes
      const permissions = Object.entries(changes).map(([page_path, can_access]) => ({
        page_path,
        can_access
      }));

      // Only save if there are changes
      if (permissions.length > 0) {
        const res = await fetch('/api/admin/page-permissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            permissions,
            granted_by: 'admin' // TODO: use actual admin user
          })
        });

        if (!res.ok) {
          throw new Error('Failed to save permissions');
        }
      }

      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error saving permissions:', err);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Reset to role defaults
  const handleResetToDefaults = async () => {
    if (!confirm('Reset all permissions to role defaults? This will remove all explicit grants.')) {
      return;
    }

    setSaving(true);
    try {
      // Delete all explicit permissions for this user
      const res = await fetch('/api/admin/page-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          permissions: [], // Empty array clears all explicit permissions
          granted_by: 'admin'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reset permissions');
      }

      // Reload
      const permsRes = await fetch(`/api/admin/page-permissions?userId=${user.id}`);
      const permsData = await permsRes.json();
      setUserPerms(permsData);
      setChanges({});
    } catch (err) {
      console.error('Error resetting permissions:', err);
      alert('Failed to reset permissions');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon />
          <span>Page Permissions: {user.username}</span>
          <Chip label={user.role} size="small" color="primary" sx={{ ml: 1 }} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <LogoSpinner label="Loading permissions..." />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pages with a checkmark are accessible to this user.
              Gray checkmarks indicate access from role defaults;
              blue checkmarks indicate explicit grants.
            </Typography>

            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              {categories.map((cat, idx) => (
                <Tab key={cat} label={cat} value={idx} />
              ))}
            </Tabs>

            {categories.map((cat, idx) => (
              <Box
                key={cat}
                role="tabpanel"
                hidden={activeTab !== idx}
                sx={{ py: 1 }}
              >
                {activeTab === idx && (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {pagesByCategory[cat].map(page => {
                      const isAccessible = isPageAccessible(page.path);
                      const accessType = getAccessType(page.path);
                      const hasChange = changes[page.path] !== undefined;

                      return (
                        <Box
                          key={page.path}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: hasChange ? 'action.selected' : 'transparent',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isAccessible}
                                onChange={() => toggleAccess(page.path, isAccessible)}
                                sx={{
                                  color: accessType === 'default' ? 'text.disabled' : 'primary.main'
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1">{page.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {page.path}
                                </Typography>
                              </Box>
                            }
                            sx={{ flex: 1 }}
                          />
                          {accessType === 'explicit' && (
                            <Chip label="Explicit" size="small" variant="outlined" />
                          )}
                          {hasChange && (
                            <Chip
                              label="Changed"
                              size="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button
          onClick={handleResetToDefaults}
          color="warning"
          disabled={saving}
        >
          Reset to Role Defaults
        </Button>
        <Box display="flex" gap={1}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !hasChanges}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pwUpdates, setPwUpdates] = useState({});
  const [permModalUser, setPermModalUser] = useState(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'username', headerName: 'Username', flex: 1, minWidth: 140 },
      {
        field: 'role',
        headerName: 'Role',
        width: 130,
        renderCell: params => (
          <Select
            size="small"
            value={params.value}
            onChange={e => handleUpdate(params.row.id, { role: e.target.value })}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        ),
      },
      {
        field: 'permissions',
        headerName: 'Permissions',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Tooltip title="Manage page permissions">
            <IconButton
              size="small"
              onClick={() => setPermModalUser(params.row)}
              color="primary"
            >
              <SecurityIcon />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: 'password',
        headerName: 'New password',
        flex: 1,
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <TextField
            size="small"
            type="password"
            value={pwUpdates[params.row.id] || ''}
            onChange={e => setPwUpdates(p => ({ ...p, [params.row.id]: e.target.value }))}
            placeholder="New password"
            fullWidth
          />
        ),
      },
      { field: 'createdAt', headerName: 'Created', width: 140 },
      {
        field: 'lastLoginAt',
        headerName: 'Last login',
        width: 140,
        valueGetter: params => (params && params.value ? params.value : '-'),
      },
      {
        field: 'loginCount',
        headerName: 'Logins',
        width: 80,
        type: 'number',
        valueGetter: params => (params && params.value !== undefined && params.value !== null ? params.value : 0),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const pwd = pwUpdates[params.row.id];
                if (pwd && pwd.length >= 4) {
                  handleUpdate(params.row.id, { password: pwd });
                  setPwUpdates(p => ({ ...p, [params.row.id]: '' }));
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              Del
            </Button>
          </Box>
        ),
      },
    ],
    [pwUpdates]
  );

  useEffect(() => {
    if (role !== 'admin') return;
    loadUsers();
  }, [role]);

  async function loadUsers() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { headers: { 'x-role': 'admin' } });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }


  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify({ id }),
      });
      if (res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete');
      }
      loadUsers();
    } catch (e) {
      setError(e.message || 'Failed to delete');
    }
  }

  async function handleUpdate(id, updates) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
        body: JSON.stringify({ id, updates }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
      loadUsers();
    } catch (e) {
      setError(e.message || 'Failed to update');
    }
  }

  if (role !== 'admin') {
    return <p style={{ padding: 16 }}>Access denied. Admins only.</p>;
  }

  return (
    <div className="app-body" style={{ justifyContent: 'center' }}>
      <main className="main" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Admin: Users</h2>
        {error && <p className="error-msg">{error}</p>}

        <section style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              Create new users with role-based permissions and domain access.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the wizard to set up users step by step.
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowCreateWizard(true)}
            size="large"
          >
            Create User
          </Button>
        </section>

        <section>
          <h3 style={{ marginBottom: 8 }}>Users</h3>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Click the shield icon to manage page-level permissions for each user.
          </Typography>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <LogoSpinner label="Loading users..." />
            </div>
          ) : (
            <Box sx={{ height: 520, width: '100%', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <DataGrid
                rows={users}
                getRowId={row => row.id}
                columns={columns}
                density="comfortable"
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 300 },
                  },
                }}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'var(--panel)' },
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                }}
              />
            </Box>
          )}
        </section>
      </main>

      {/* Permission Management Modal */}
      <PermissionModal
        open={!!permModalUser}
        onClose={() => setPermModalUser(null)}
        user={permModalUser}
        onSave={() => {
          // Could refresh user data here if needed
        }}
      />

      {/* Create User Wizard */}
      <CreateUserWizard
        open={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSuccess={() => {
          loadUsers();
        }}
      />
    </div>
  );
}
