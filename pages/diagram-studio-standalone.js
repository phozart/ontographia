// pages/diagram-studio-standalone.js
// Standalone DiagramStudio page for full-featured diagramming

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import DiagramStudio from '../components/diagram-studio/DiagramStudio';
import { createDefaultRegistry } from '../components/diagram-studio/packs';
import { getProfile, PROFILES } from '../components/diagram-studio/DiagramProfile';
import { TemplateSelector } from '../components/diagram-studio/templates/TemplateManager';

export default function DiagramStudioStandalonePage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  const [diagramId, setDiagramId] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedPack, setSelectedPack] = useState('process-flow');

  // Create pack registry
  const packRegistry = useMemo(() => {
    return createDefaultRegistry();
  }, []);

  // Get diagram ID from URL or localStorage (last used diagram)
  useEffect(() => {
    if (router.query.id) {
      setDiagramId(router.query.id);
      // Save as last used diagram
      if (typeof window !== 'undefined') {
        localStorage.setItem('ds-last-diagram', router.query.id);
      }
    } else {
      // Try to load last used diagram
      if (typeof window !== 'undefined') {
        const lastDiagram = localStorage.getItem('ds-last-diagram');
        if (lastDiagram) {
          setDiagramId(lastDiagram);
          // Update URL without full navigation
          router.replace(`/diagram-studio-standalone?id=${lastDiagram}`, undefined, { shallow: true });
        }
      }
    }
  }, [router.query.id]);

  // Handle save
  const handleSave = useCallback(async (diagram) => {
    if (!user) {
      console.warn('Cannot save: user not authenticated');
      return null;
    }

    try {
      const method = diagram.id ? 'PUT' : 'POST';
      const url = diagram.id ? `/api/diagrams/${diagram.id}` : '/api/diagrams';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role || 'viewer',
        },
        body: JSON.stringify({
          ...diagram,
          domainId: activeDomain,
          userId: user,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        if (!diagram.id) {
          // Update URL with new diagram ID
          router.replace(`/diagram-studio-standalone?id=${saved.id}`, undefined, { shallow: true });
          setDiagramId(saved.id);
        }
        return saved;
      } else {
        console.error('Failed to save diagram:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  }, [activeDomain, user, role, router]);

  // Handle export
  const handleExport = useCallback((format) => {
    // Export is handled by DiagramStudio's internal ExportManager
    console.log('Export requested:', format);
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback((diagram, template) => {
    setShowTemplateSelector(false);
    // Create new diagram from template
    handleSave({
      ...diagram,
      name: template.name,
    });
  }, [handleSave]);

  // Get profile based on user role
  const profile = useMemo(() => {
    if (role === 'viewer') {
      return getProfile('embedded-readonly');
    }
    return getProfile('full-studio');
  }, [role]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text)',
            margin: 0,
          }}>
            Diagram Studio
          </h1>

          {/* Pack Selector */}
          <select
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
          >
            <option value="process-flow">Process Flow</option>
            <option value="sticky-notes">Sticky Notes</option>
            <option value="cld">Causal Loop Diagram</option>
            <option value="uml-class">UML Class Diagram</option>
            <option value="mind-map">Mind Map</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowTemplateSelector(true)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--bg)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            Templates
          </button>

          <button
            onClick={() => {
              setDiagramId(null);
              router.replace('/diagram-studio-standalone', undefined, { shallow: true });
            }}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              borderRadius: 6,
              background: 'var(--accent)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + New Diagram
          </button>
        </div>
      </div>

      {/* DiagramStudio Component */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <DiagramStudio
          diagramId={diagramId}
          profile={profile}
          packRegistry={packRegistry}
          onSave={handleSave}
          onExport={handleExport}
        />
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '90%',
            maxWidth: 800,
            maxHeight: '80vh',
            background: 'var(--bg-surface)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <TemplateSelector
              packRegistry={packRegistry}
              packId={selectedPack}
              onSelect={handleTemplateSelect}
              onCancel={() => setShowTemplateSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
