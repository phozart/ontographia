// components/ProjectContext.js
// Project Management Context for BA Requirements Workspace
// Phase 9: Updated to use API persistence with localStorage fallback
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';

// Project status options
export const PROJECT_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  CLOSED: 'Closed',
};

// Project roles
export const PROJECT_ROLES = {
  BA: 'Business Analyst',
  PO: 'Product Owner',
  STAKEHOLDER: 'Stakeholder',
  VIEWER: 'Viewer',
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [PROJECT_ROLES.BA]: ['create', 'edit', 'delete', 'approve', 'comment', 'view'],
  [PROJECT_ROLES.PO]: ['create', 'edit', 'approve', 'comment', 'view'],
  [PROJECT_ROLES.STAKEHOLDER]: ['approve', 'comment', 'view'],
  [PROJECT_ROLES.VIEWER]: ['view'],
};

const ProjectContext = createContext({
  projects: [],
  activeProject: null,
  activeProjectId: null,
  setActiveProject: () => {},
  createProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  addProjectMember: () => {},
  removeProjectMember: () => {},
  updateProjectMember: () => {},
  getProjectMembers: () => [],
  getUserProjectRole: () => null,
  canUserPerform: () => false,
  findByDisplayId: () => null,
  loading: false,
  error: '',
  useApi: false, // Whether using API or localStorage
});

export function ProjectProvider({ children }) {
  const { user, role: userRole } = useAuth();
  const { activeDomain } = useDomains();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useApi, setUseApi] = useState(false);

  // Get active project object
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // Filter projects accessible to user
  const accessibleProjects = useMemo(() => {
    if (!user) return [];
    if (userRole === 'admin') return projects;
    return projects.filter(p =>
      p.createdBy === user || p.created_by === user ||
      (p.members || []).some(m => m.userId === user || m.user_id === user)
    );
  }, [projects, user, userRole]);

  // Load projects from API or localStorage
  useEffect(() => {
    if (!user || !activeDomain) {
      setProjects([]);
      setActiveProjectId(null);
      return;
    }

    async function loadProjects() {
      setLoading(true);
      setError('');
      const headers = { 'x-user': user, 'x-role': userRole };

      console.log('[ProjectContext] Loading projects with user:', user, 'role:', userRole, 'domain:', activeDomain);

      try {
        const res = await fetch(`/api/projects?domainId=${activeDomain}`, { headers });
        console.log('[ProjectContext] API response status:', res.status);
        if (res.ok) {
          let data = await res.json();
          data = Array.isArray(data) ? data : [];
          setUseApi(true);

          // Check localStorage for projects that might not be in the database yet
          const storageKey = `ba-projects-${activeDomain}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const localProjects = JSON.parse(stored);
              if (Array.isArray(localProjects) && localProjects.length > 0) {
                // Find projects in localStorage that aren't in the database
                const dbProjectIds = new Set(data.map(p => p.id));
                const missingProjects = localProjects.filter(p => !dbProjectIds.has(p.id));

                if (missingProjects.length > 0) {
                  console.log(`[ProjectContext] Found ${missingProjects.length} projects in localStorage not in DB, migrating...`);

                  // Migrate missing projects to database
                  for (const project of missingProjects) {
                    try {
                      const migrateRes = await fetch('/api/projects', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...headers },
                        body: JSON.stringify({
                          ...project,
                          domainId: activeDomain,
                        }),
                      });
                      if (migrateRes.ok) {
                        const migrated = await migrateRes.json();
                        data.push(migrated);
                        console.log(`[ProjectContext] Migrated project: ${project.name}`);
                      }
                    } catch (migrateErr) {
                      console.error(`[ProjectContext] Failed to migrate project ${project.name}:`, migrateErr);
                    }
                  }

                  // Clear localStorage after successful migration
                  if (data.length > 0) {
                    localStorage.removeItem(storageKey);
                    console.log('[ProjectContext] Cleared localStorage after migration');
                  }
                }
              }
            } catch (parseErr) {
              console.error('[ProjectContext] Failed to parse localStorage:', parseErr);
            }
          }

          setProjects(data);

          // Restore active project from localStorage (session preference)
          const activeKey = `ba-active-project-${activeDomain}`;
          const storedActive = localStorage.getItem(activeKey);
          if (storedActive && data.some(p => p.id === storedActive)) {
            setActiveProjectId(storedActive);
          } else if (data.length > 0) {
            setActiveProjectId(data[0].id);
          }
          console.log(`[ProjectContext] Loaded ${data.length} projects from API`);
        } else {
          console.error('[ProjectContext] API returned:', res.status);
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Fallback to localStorage only if API fails
        console.log('Falling back to localStorage for projects');
        setUseApi(false);
        try {
          const storageKey = `ba-projects-${activeDomain}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            setProjects(Array.isArray(parsed) ? parsed : []);
          } else {
            setProjects([]);
          }

          // Restore active project
          const activeKey = `ba-active-project-${activeDomain}`;
          const storedActive = localStorage.getItem(activeKey);
          if (storedActive) {
            setActiveProjectId(storedActive);
          }
        } catch (localError) {
          setError(localError.message || 'Failed to load projects');
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [user, userRole, activeDomain]);

  // Save projects to localStorage (fallback)
  const saveProjectsToStorage = useCallback((projectList) => {
    if (!activeDomain) return;
    const storageKey = `ba-projects-${activeDomain}`;
    localStorage.setItem(storageKey, JSON.stringify(projectList));
  }, [activeDomain]);

  // Set active project
  const setActiveProject = useCallback((projectId) => {
    setActiveProjectId(projectId);
    if (activeDomain && projectId) {
      const activeKey = `ba-active-project-${activeDomain}`;
      localStorage.setItem(activeKey, projectId);
    }
  }, [activeDomain]);

  // Create new project
  const createProject = useCallback(async (projectData) => {
    const newProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      businessContext: projectData.businessContext || '',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || null,
      status: projectData.status || PROJECT_STATUS.DRAFT,
      // Scoping (FR-1.2)
      inScope: projectData.inScope || [],
      outOfScope: projectData.outOfScope || [],
      objectives: projectData.objectives || [],
      successCriteria: projectData.successCriteria || [],
      // Members (FR-1.3)
      members: [
        { userId: user, role: PROJECT_ROLES.BA, addedAt: new Date().toISOString() }
      ],
      // Metadata
      createdBy: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      domain: activeDomain,
      // Stats for dashboard
      stats: {
        requirementsCount: 0,
        ticketsCount: 0,
        pendingApprovals: 0,
        linkedModels: 0,
      },
    };

    console.log('[ProjectContext] Creating project, useApi:', useApi, 'user:', user);

    if (useApi) {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': userRole },
          body: JSON.stringify({
            ...newProject,
            domainId: activeDomain,
          }),
        });
        console.log('[ProjectContext] Create response status:', res.status);
        if (res.ok) {
          const created = await res.json();
          console.log('[ProjectContext] Created project:', created.id, created.name);
          // Optimistic update then sync
          setProjects(prev => [...prev, created]);
          setActiveProject(created.id);
          return created;
        } else {
          const errorText = await res.text();
          console.error('[ProjectContext] Create failed:', res.status, errorText);
        }
      } catch (err) {
        console.error('API create failed, using local:', err);
      }
    } else {
      console.log('[ProjectContext] useApi is false, falling back to localStorage');
    }

    // Fallback to localStorage
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjectsToStorage(updated);
    setActiveProject(newProject.id);
    return newProject;
  }, [projects, user, userRole, activeDomain, saveProjectsToStorage, setActiveProject, useApi]);

  // Update project
  const updateProject = useCallback(async (projectId, updates) => {
    // Optimistic update
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setProjects(updated);

    if (useApi) {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': userRole },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          console.error('API update failed');
        }
      } catch (err) {
        console.error('API update error:', err);
      }
    } else {
      saveProjectsToStorage(updated);
    }
  }, [projects, saveProjectsToStorage, useApi, user, userRole]);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    // Optimistic update
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);

    if (activeProjectId === projectId) {
      setActiveProject(updated[0]?.id || null);
    }

    if (useApi) {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: { 'x-user': user, 'x-role': userRole },
        });
        if (!res.ok) {
          console.error('API delete failed');
        }
      } catch (err) {
        console.error('API delete error:', err);
      }
    } else {
      saveProjectsToStorage(updated);
    }
  }, [projects, activeProjectId, saveProjectsToStorage, setActiveProject, useApi, user, userRole]);

  // Add member to project
  const addProjectMember = useCallback(async (projectId, userId, role) => {
    const authHeaders = { 'x-user': user, 'x-role': userRole };
    if (useApi) {
      try {
        const res = await fetch(`/api/projects/${projectId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ userId, role }),
        });
        if (res.ok) {
          // Refresh members from API
          const membersRes = await fetch(`/api/projects/${projectId}/members`, { headers: authHeaders });
          if (membersRes.ok) {
            const members = await membersRes.json();
            updateProject(projectId, { members });
          }
          return;
        }
      } catch (err) {
        console.error('API addMember error:', err);
      }
    }

    // Fallback
    updateProject(projectId, {
      members: [
        ...(projects.find(p => p.id === projectId)?.members || []),
        { userId, role, addedAt: new Date().toISOString() }
      ]
    });
  }, [projects, updateProject, useApi, user, userRole]);

  // Remove member from project
  const removeProjectMember = useCallback(async (projectId, userId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (useApi) {
      try {
        const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
          method: 'DELETE',
          headers: { 'x-user': user, 'x-role': userRole },
        });
        if (res.ok) {
          updateProject(projectId, {
            members: project.members.filter(m => m.userId !== userId && m.user_id !== userId)
          });
          return;
        }
      } catch (err) {
        console.error('API removeMember error:', err);
      }
    }

    // Fallback
    updateProject(projectId, {
      members: project.members.filter(m => m.userId !== userId)
    });
  }, [projects, updateProject, useApi, user, userRole]);

  // Update member role
  const updateProjectMember = useCallback(async (projectId, userId, newRole) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (useApi) {
      try {
        const res = await fetch(`/api/projects/${projectId}/members`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': userRole },
          body: JSON.stringify({ userId, role: newRole }),
        });
        if (res.ok) {
          updateProject(projectId, {
            members: project.members.map(m =>
              (m.userId === userId || m.user_id === userId) ? { ...m, role: newRole } : m
            )
          });
          return;
        }
      } catch (err) {
        console.error('API updateMember error:', err);
      }
    }

    // Fallback
    updateProject(projectId, {
      members: project.members.map(m =>
        m.userId === userId ? { ...m, role: newRole } : m
      )
    });
  }, [projects, updateProject, useApi, user, userRole]);

  // Get project members
  const getProjectMembers = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.members || [];
  }, [projects]);

  // Get user's role in a project
  const getUserProjectRole = useCallback((projectId, userId = user) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    if (project.createdBy === userId) return PROJECT_ROLES.BA;
    const member = project.members.find(m => m.userId === userId);
    return member?.role || null;
  }, [projects, user]);

  // Check if user can perform action
  const canUserPerform = useCallback((projectId, action, userId = user) => {
    if (userRole === 'admin') return true;
    const projectRole = getUserProjectRole(projectId, userId);
    if (!projectRole) return false;
    return ROLE_PERMISSIONS[projectRole]?.includes(action) || false;
  }, [getUserProjectRole, userRole, user]);

  // Find project by display ID (PRJ-0001 format)
  // Handles both camelCase (displayId) and snake_case (display_id) from API
  const findByDisplayId = useCallback((displayId) => {
    if (!displayId) return null;
    return accessibleProjects.find(p =>
      p.displayId === displayId || p.display_id === displayId
    ) || null;
  }, [accessibleProjects]);

  const value = {
    projects: accessibleProjects,
    activeProject,
    activeProjectId,
    setActiveProject,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    updateProjectMember,
    getProjectMembers,
    getUserProjectRole,
    canUserPerform,
    findByDisplayId,
    loading,
    error,
    useApi, // Flag indicating if using API or localStorage
    PROJECT_STATUS,
    PROJECT_ROLES,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectContext);
}

export default ProjectContext;
