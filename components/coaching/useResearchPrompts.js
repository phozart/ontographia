/**
 * useResearchPrompts - React hook for managing research prompts
 *
 * Provides a simple interface for components to:
 * - Generate prompts for artefacts
 * - Track prompt status (copied, researched)
 * - Manage research notes
 * - Get user statistics
 *
 * @module components/coaching/useResearchPrompts
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing research prompts
 *
 * @param {Object} options - Configuration options
 * @param {string} options.artefactId - Current artefact ID (optional)
 * @param {string} options.trigger - Trigger type for prompt generation
 * @returns {Object} Prompt state and actions
 */
export function useResearchPrompts({ artefactId = null, trigger = null } = {}) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  /**
   * Generate prompts for an artefact
   */
  const generatePrompts = useCallback(async (artId = artefactId, trig = trigger) => {
    if (!artId) {
      setError('Artefact ID required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artefactId: artId,
          trigger: trig
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
      return data.prompts || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [artefactId, trigger]);

  /**
   * Generate a single prompt with custom context
   */
  const generateWithContext = useCallback(async (promptId, context) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptId,
          context
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate prompt');
      }

      const data = await response.json();
      const newPrompts = data.prompts || [];
      setPrompts(prev => [...prev, ...newPrompts]);
      return newPrompts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch existing prompts for current artefact
   */
  const fetchPrompts = useCallback(async (artId = artefactId) => {
    if (!artId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts?artefactId=${artId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [artefactId]);

  /**
   * Fetch all user prompts
   */
  const fetchAllPrompts = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.offset) params.set('offset', options.offset.toString());
      params.set('includeStats', 'true');

      const response = await fetch(`/api/prompts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark prompt as copied
   */
  const markCopied = useCallback(async (promptId) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/mark-researched`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'copied' })
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }

      const data = await response.json();

      // Update local state
      setPrompts(prev =>
        prev.map(p =>
          p.id === promptId ? { ...p, status: 'copied' } : p
        )
      );

      return data.prompt;
    } catch (err) {
      console.error('Error marking prompt copied:', err);
      return null;
    }
  }, []);

  /**
   * Mark prompt as researched
   */
  const markResearched = useCallback(async (promptId, notes = null) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/mark-researched`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        throw new Error('Failed to mark as researched');
      }

      const data = await response.json();

      // Update local state
      setPrompts(prev =>
        prev.map(p =>
          p.id === promptId
            ? { ...p, status: 'researched', notes, researched_at: new Date().toISOString() }
            : p
        )
      );

      // Update stats if we have them
      if (stats) {
        setStats(prev => ({
          ...prev,
          researched: prev.researched + 1,
          researchRate: Math.round(((prev.researched + 1) / prev.totalPrompts) * 100)
        }));
      }

      return data.prompt;
    } catch (err) {
      console.error('Error marking prompt researched:', err);
      return null;
    }
  }, [stats]);

  /**
   * Update prompt notes
   */
  const updateNotes = useCallback(async (promptId, notes) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/mark-researched`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'notes', notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      const data = await response.json();

      // Update local state
      setPrompts(prev =>
        prev.map(p =>
          p.id === promptId ? { ...p, notes } : p
        )
      );

      return data.prompt;
    } catch (err) {
      console.error('Error updating notes:', err);
      return null;
    }
  }, []);

  /**
   * Clear prompts
   */
  const clearPrompts = useCallback(() => {
    setPrompts([]);
    setError(null);
  }, []);

  return {
    // State
    prompts,
    loading,
    error,
    stats,

    // Actions
    generatePrompts,
    generateWithContext,
    fetchPrompts,
    fetchAllPrompts,
    markCopied,
    markResearched,
    updateNotes,
    clearPrompts,

    // Computed
    hasPrompts: prompts.length > 0,
    activePrompts: prompts.filter(p => p.status !== 'researched'),
    researchedPrompts: prompts.filter(p => p.status === 'researched')
  };
}

export default useResearchPrompts;
