import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({
  user: null,
  role: null,
  hydrated: false,
  login: async () => {},
  logout: () => {},
});

const defaultRouteForRole = role => {
  if (role === 'admin' || role === 'editor') return '/home';
  if (role === 'viewer') return '/home';
  return '/login';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem('kg-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.role) {
          setUser(parsed.user);
          setRole(parsed.role);
        }
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
  }, []);

  const login = async ({ username, password }) => {
    if (!username || !password) throw new Error('Username and password are required');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.username);
    setRole(data.role);
    window.localStorage.setItem('kg-auth', JSON.stringify({ user: data.username, role: data.role }));
    const dest = defaultRouteForRole(data.role);
    router.push(dest);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    window.localStorage.removeItem('kg-auth');
    router.push('/login');
  };

  const value = useMemo(
    () => ({
      user,
      role,
      hydrated,
      login,
      logout,
    }),
    [user, role, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRouteGuard() {
  const { role, hydrated } = useAuth();
  const router = useRouter();

  const allowedRoutes = useMemo(() => {
    if (!role) return ['/', '/login'];
    const studioRoutes = ['/studio', '/graphnavigator'];
    const modelRoutes = ['/semanticmodelbrowser', '/user-view'];
    const homeRoute = ['/home'];
    if (role === 'admin') return ['/', ...homeRoute, ...studioRoutes, ...modelRoutes, '/nodes', '/relationships', '/settings', '/node-types', '/relationship-types', '/admin/users', '/login'];
    if (role === 'editor') return ['/', ...homeRoute, ...studioRoutes, ...modelRoutes, '/settings', '/login'];
    if (role === 'viewer') return ['/', ...homeRoute, ...studioRoutes, ...modelRoutes, '/settings', '/login'];
    return ['/login'];
  }, [role]);

  const enforceRoute = () => {
    if (!router?.pathname || !hydrated) return;
    const path = router.pathname;
    if (role && path === '/') {
      router.replace('/home');
      return;
    }
    if (!allowedRoutes.includes(path)) {
      const dest = role ? '/home' : '/login';
      router.replace(dest);
    }
  };

  return { enforceRoute };
}
