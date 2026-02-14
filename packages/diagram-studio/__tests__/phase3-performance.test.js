/**
 * Phase 3 Performance and Polish Tests
 * Tests for viewport culling, LOD rendering, version history, and templates
 */

import { renderHook, act } from '@testing-library/react';

// Test viewport culling
describe('Viewport Culling', () => {
  const {
    useViewportCulling,
    useConnectionCulling,
    useCulling,
    SpatialIndex,
  } = require('../src/hooks/useViewportCulling.js');

  describe('useViewportCulling', () => {
    it('should filter elements outside viewport', () => {
      const elements = [
        { id: '1', position: { x: 100, y: 100 }, size: { width: 100, height: 100 } },
        { id: '2', position: { x: 2000, y: 2000 }, size: { width: 100, height: 100 } },
        { id: '3', position: { x: 500, y: 300 }, size: { width: 100, height: 100 } },
      ];

      const viewport = { x: 0, y: 0, zoom: 1 };

      const { result } = renderHook(() =>
        useViewportCulling(elements, viewport, {
          containerWidth: 1200,
          containerHeight: 800,
          buffer: 200,
        })
      );

      // Element at 2000,2000 should be culled
      expect(result.current.length).toBe(2);
      expect(result.current.find((e) => e.id === '1')).toBeDefined();
      expect(result.current.find((e) => e.id === '3')).toBeDefined();
      expect(result.current.find((e) => e.id === '2')).toBeUndefined();
    });

    it('should work with object elements', () => {
      const elements = {
        '1': { id: '1', position: { x: 100, y: 100 }, size: { width: 100, height: 100 } },
        '2': { id: '2', position: { x: 500, y: 300 }, size: { width: 100, height: 100 } },
      };

      const viewport = { x: 0, y: 0, zoom: 1 };

      const { result } = renderHook(() =>
        useViewportCulling(elements, viewport, { containerWidth: 1200, containerHeight: 800 })
      );

      expect(result.current.length).toBe(2);
    });

    it('should include elements when disabled', () => {
      const elements = [
        { id: '1', position: { x: 100, y: 100 }, size: { width: 100, height: 100 } },
        { id: '2', position: { x: 5000, y: 5000 }, size: { width: 100, height: 100 } },
      ];

      const viewport = { x: 0, y: 0, zoom: 1 };

      const { result } = renderHook(() =>
        useViewportCulling(elements, viewport, { enabled: false })
      );

      expect(result.current.length).toBe(2);
    });
  });

  describe('SpatialIndex', () => {
    it('should build index from elements', () => {
      const index = new SpatialIndex(500);
      const elements = [
        { id: '1', position: { x: 100, y: 100 }, size: { width: 100, height: 100 } },
        { id: '2', position: { x: 600, y: 600 }, size: { width: 100, height: 100 } },
      ];

      index.build(elements);

      expect(index.cells.size).toBeGreaterThan(0);
    });

    it('should query elements in bounds', () => {
      const index = new SpatialIndex(500);
      const elements = {
        '1': { id: '1', position: { x: 100, y: 100 }, size: { width: 100, height: 100 } },
        '2': { id: '2', position: { x: 600, y: 600 }, size: { width: 100, height: 100 } },
        '3': { id: '3', position: { x: 1500, y: 1500 }, size: { width: 100, height: 100 } },
      };

      index.build(elements);

      const results = index.query(
        { minX: 0, minY: 0, maxX: 800, maxY: 800 },
        elements
      );

      expect(results.length).toBe(2);
      expect(results.find((e) => e.id === '3')).toBeUndefined();
    });
  });
});

// Test LOD rendering
describe('LOD Rendering', () => {
  const {
    getLODLevel,
    LOD_THRESHOLDS,
  } = require('../src/components/canvas/LODRenderer.js');

  describe('getLODLevel', () => {
    it('should return full detail at high zoom', () => {
      expect(getLODLevel(1)).toBe('full');
      expect(getLODLevel(0.75)).toBe('full');
      expect(getLODLevel(0.5)).toBe('full');
    });

    it('should return medium detail at moderate zoom', () => {
      expect(getLODLevel(0.4)).toBe('medium');
      expect(getLODLevel(0.3)).toBe('medium');
    });

    it('should return low detail at low zoom', () => {
      expect(getLODLevel(0.2)).toBe('low');
      expect(getLODLevel(0.15)).toBe('low');
    });

    it('should return minimal detail at very low zoom', () => {
      expect(getLODLevel(0.05)).toBe('minimal');
      expect(getLODLevel(0.01)).toBe('minimal');
    });
  });

  describe('LOD_THRESHOLDS', () => {
    it('should define all thresholds', () => {
      expect(LOD_THRESHOLDS.FULL).toBeDefined();
      expect(LOD_THRESHOLDS.MEDIUM).toBeDefined();
      expect(LOD_THRESHOLDS.LOW).toBeDefined();
      expect(LOD_THRESHOLDS.MINIMAL).toBeDefined();
    });

    it('should have decreasing threshold values', () => {
      expect(LOD_THRESHOLDS.FULL).toBeGreaterThan(LOD_THRESHOLDS.MEDIUM);
      expect(LOD_THRESHOLDS.MEDIUM).toBeGreaterThan(LOD_THRESHOLDS.LOW);
      expect(LOD_THRESHOLDS.LOW).toBeGreaterThan(LOD_THRESHOLDS.MINIMAL);
    });
  });
});

// Test animated viewport
describe('Animated Viewport', () => {
  const {
    useAnimatedViewport,
    createViewportSequence,
    EASING,
  } = require('../src/hooks/useAnimatedViewport.js');

  describe('useAnimatedViewport', () => {
    it('should initialize with default viewport', () => {
      const { result } = renderHook(() => useAnimatedViewport());

      expect(result.current.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
      expect(result.current.isAnimating).toBe(false);
    });

    it('should initialize with custom viewport', () => {
      const initial = { x: 100, y: 200, zoom: 0.5 };
      const { result } = renderHook(() => useAnimatedViewport(initial));

      expect(result.current.viewport).toEqual(initial);
    });

    it('should set instant viewport', () => {
      const { result } = renderHook(() => useAnimatedViewport());

      act(() => {
        result.current.setInstant({ x: 500, y: 300 });
      });

      expect(result.current.viewport.x).toBe(500);
      expect(result.current.viewport.y).toBe(300);
    });

    it('should provide animation methods', () => {
      const { result } = renderHook(() => useAnimatedViewport());

      expect(result.current.panTo).toBeDefined();
      expect(result.current.zoomTo).toBeDefined();
      expect(result.current.zoomIn).toBeDefined();
      expect(result.current.zoomOut).toBeDefined();
      expect(result.current.zoomToFit).toBeDefined();
      expect(result.current.centerOn).toBeDefined();
      expect(result.current.fitElement).toBeDefined();
      expect(result.current.reset).toBeDefined();
    });
  });

  describe('EASING', () => {
    it('should define all easing functions', () => {
      expect(EASING.linear).toBeDefined();
      expect(EASING.easeIn).toBeDefined();
      expect(EASING.easeOut).toBeDefined();
      expect(EASING.easeInOut).toBeDefined();
      expect(EASING.easeOutCubic).toBeDefined();
      expect(EASING.spring).toBeDefined();
    });

    it('should return correct values at boundaries', () => {
      Object.values(EASING).forEach((fn) => {
        expect(fn(0)).toBeCloseTo(0, 5);
        expect(fn(1)).toBeCloseTo(1, 5);
      });
    });
  });

  describe('createViewportSequence', () => {
    it('should create a sequence builder', () => {
      const seq = createViewportSequence();

      expect(seq.panTo).toBeDefined();
      expect(seq.zoomTo).toBeDefined();
      expect(seq.centerOn).toBeDefined();
      expect(seq.delay).toBeDefined();
      expect(seq.getSteps).toBeDefined();
      expect(seq.execute).toBeDefined();
    });

    it('should build sequence steps', () => {
      const seq = createViewportSequence()
        .panTo(100, 200)
        .zoomTo(0.5)
        .delay(500);

      const steps = seq.getSteps();

      expect(steps.length).toBe(3);
      expect(steps[0].type).toBe('pan');
      expect(steps[1].type).toBe('zoom');
      expect(steps[2].type).toBe('delay');
    });
  });
});

// Test version history
describe('Version History', () => {
  const { VersionHistory, useVersionHistory } = require('../src/components/VersionHistory.js');

  it('should export VersionHistory component', () => {
    expect(VersionHistory).toBeDefined();
  });

  it('should export useVersionHistory hook', () => {
    expect(useVersionHistory).toBeDefined();
  });
});

// Test template gallery
describe('Template Gallery', () => {
  const {
    TemplateGallery,
    useTemplateGallery,
    TEMPLATE_CATEGORIES,
    DEFAULT_TEMPLATES,
  } = require('../src/components/TemplateGallery.js');

  describe('TemplateGallery', () => {
    it('should export TemplateGallery component', () => {
      expect(TemplateGallery).toBeDefined();
    });

    it('should export useTemplateGallery hook', () => {
      expect(useTemplateGallery).toBeDefined();
    });
  });

  describe('TEMPLATE_CATEGORIES', () => {
    it('should define all categories', () => {
      expect(TEMPLATE_CATEGORIES.ALL).toBeDefined();
      expect(TEMPLATE_CATEGORIES.BUSINESS).toBeDefined();
      expect(TEMPLATE_CATEGORIES.STRATEGY).toBeDefined();
      expect(TEMPLATE_CATEGORIES.PROCESS).toBeDefined();
      expect(TEMPLATE_CATEGORIES.TECHNICAL).toBeDefined();
      expect(TEMPLATE_CATEGORIES.BRAINSTORM).toBeDefined();
      expect(TEMPLATE_CATEGORIES.PLANNING).toBeDefined();
      expect(TEMPLATE_CATEGORIES.RESEARCH).toBeDefined();
      expect(TEMPLATE_CATEGORIES.CUSTOM).toBeDefined();
    });

    it('should have category properties', () => {
      Object.values(TEMPLATE_CATEGORIES).forEach((cat) => {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.icon).toBeDefined();
      });
    });
  });

  describe('DEFAULT_TEMPLATES', () => {
    it('should include blank template', () => {
      const blank = DEFAULT_TEMPLATES.find((t) => t.id === 'blank');
      expect(blank).toBeDefined();
      expect(blank.isBlank).toBe(true);
    });

    it('should include business model canvas', () => {
      const bmc = DEFAULT_TEMPLATES.find((t) => t.id === 'business-model-canvas');
      expect(bmc).toBeDefined();
      expect(bmc.category).toBe('business');
      expect(bmc.elements.length).toBeGreaterThan(0);
    });

    it('should include SWOT template', () => {
      const swot = DEFAULT_TEMPLATES.find((t) => t.id === 'swot');
      expect(swot).toBeDefined();
      expect(swot.category).toBe('strategy');
    });

    it('should include flowchart template', () => {
      const flow = DEFAULT_TEMPLATES.find((t) => t.id === 'flowchart');
      expect(flow).toBeDefined();
      expect(flow.category).toBe('process');
      expect(flow.connections.length).toBeGreaterThan(0);
    });

    it('should have required properties for all templates', () => {
      DEFAULT_TEMPLATES.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
      });
    });
  });
});

// Test components index exports
describe('Phase 3 Component Exports', () => {
  const Components = require('../src/components/index.js');

  it('should export LOD components', () => {
    expect(Components.LODElement).toBeDefined();
    expect(Components.LODConnection).toBeDefined();
    expect(Components.LODCanvas).toBeDefined();
    expect(Components.LODStats).toBeDefined();
    expect(Components.LOD_THRESHOLDS).toBeDefined();
    expect(Components.getLODLevel).toBeDefined();
    expect(Components.useLODLevel).toBeDefined();
  });

  it('should export version history components', () => {
    expect(Components.VersionHistory).toBeDefined();
    expect(Components.useVersionHistory).toBeDefined();
  });

  it('should export template gallery components', () => {
    expect(Components.TemplateGallery).toBeDefined();
    expect(Components.useTemplateGallery).toBeDefined();
    expect(Components.TEMPLATE_CATEGORIES).toBeDefined();
    expect(Components.DEFAULT_TEMPLATES).toBeDefined();
  });
});

// Test main index exports
describe('Phase 3 Main Index Exports', () => {
  const DiagramStudio = require('../src/index.js');

  it('should export viewport culling hooks', () => {
    expect(DiagramStudio.useViewportCulling).toBeDefined();
    expect(DiagramStudio.useConnectionCulling).toBeDefined();
    expect(DiagramStudio.useCulling).toBeDefined();
    expect(DiagramStudio.useSpatialCulling).toBeDefined();
    expect(DiagramStudio.SpatialIndex).toBeDefined();
  });

  it('should export animated viewport hooks', () => {
    expect(DiagramStudio.useAnimatedViewport).toBeDefined();
    expect(DiagramStudio.createViewportSequence).toBeDefined();
    expect(DiagramStudio.EASING).toBeDefined();
  });
});
