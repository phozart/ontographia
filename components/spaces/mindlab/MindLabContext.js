// components/spaces/mindlab/MindLabContext.js
// State management for Mind Lab - Personal Thinking Workspace
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../AuthContext';

const MindLabContext = createContext(null);

export function MindLabProvider({ children }) {
  const { user } = useAuth();

  const [activeSpace, setActiveSpace] = useState('reasoning');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const thinkingSpaces = [
    { id: 'reasoning', name: 'Strategic Reasoning', description: 'Explore problems through structured reasoning frameworks', icon: 'Psychology', color: '#8b5cf6' },
    { id: 'sensemaking', name: 'Sensemaking', description: 'Make sense of complex situations through multiple lenses', icon: 'Visibility', color: '#06b6d4' },
    { id: 'philosophy', name: 'Philosophy', description: 'Apply philosophical inquiry to challenge assumptions', icon: 'AutoStories', color: '#ec4899' },
    { id: 'negotiation', name: 'Negotiation', description: 'Prepare for and reflect on negotiations', icon: 'Handshake', color: '#f59e0b' },
  ];

  const getHeaders = useCallback(() => ({ 'Content-Type': 'application/json', 'x-user': user || '', 'x-role': 'admin' }), [user]);

  const createSession = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const newSession = { id: `session-${Date.now()}`, space: activeSpace, title: data.title || `${activeSpace} session`, createdAt: new Date().toISOString(), notes: data.notes || '', ...data };
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      return newSession;
    } finally { setIsLoading(false); }
  }, [activeSpace]);

  const updateSession = useCallback(async (id, data) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
    if (activeSession?.id === id) setActiveSession(prev => ({ ...prev, ...data }));
  }, [activeSession]);

  const deleteSession = useCallback(async (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession?.id === id) setActiveSession(null);
  }, [activeSession]);

  const getSpaceConfig = useCallback((spaceId) => thinkingSpaces.find(s => s.id === spaceId) || thinkingSpaces[0], []);
  const activeSpaceSessions = sessions.filter(s => s.space === activeSpace);

  return (
    <MindLabContext.Provider value={{ activeSpace, sessions, activeSession, activeSpaceSessions, isLoading, thinkingSpaces, setActiveSpace, setActiveSession, createSession, updateSession, deleteSession, getSpaceConfig, getHeaders }}>
      {children}
    </MindLabContext.Provider>
  );
}

export function useMindLab() {
  const context = useContext(MindLabContext);
  if (!context) throw new Error('useMindLab must be used within a MindLabProvider');
  return context;
}
