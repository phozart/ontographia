// components/diagram-core/utils/alignmentGuides.js
// Alignment guide calculations for smart snapping

/**
 * Calculate alignment guides for a dragged element against other elements
 * @param {Object} draggedElement - The element being dragged { x, y, width, height }
 * @param {Array} otherElements - Other elements to align against
 * @param {number} threshold - Pixel threshold for alignment detection (default 8)
 * @returns {Object} { guides: { horizontal: [], vertical: [] }, snapX, snapY }
 */
export function calculateAlignmentGuides(draggedElement, otherElements, threshold = 8) {
  const guides = { horizontal: [], vertical: [] };
  let snapX = null;
  let snapY = null;

  const draggedLeft = draggedElement.x;
  const draggedRight = draggedElement.x + draggedElement.width;
  const draggedTop = draggedElement.y;
  const draggedBottom = draggedElement.y + draggedElement.height;
  const draggedCenterX = draggedElement.x + draggedElement.width / 2;
  const draggedCenterY = draggedElement.y + draggedElement.height / 2;

  for (const other of otherElements) {
    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherTop = other.y;
    const otherBottom = other.y + other.height;
    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;

    // Vertical alignment checks (x-axis)

    // Left-to-left alignment
    if (Math.abs(draggedLeft - otherLeft) < threshold) {
      guides.vertical.push({ x: otherLeft, type: 'left-left', otherElement: other });
      if (snapX === null || Math.abs(draggedLeft - otherLeft) < Math.abs(draggedLeft - snapX)) {
        snapX = otherLeft;
      }
    }

    // Right-to-right alignment
    if (Math.abs(draggedRight - otherRight) < threshold) {
      guides.vertical.push({ x: otherRight, type: 'right-right', otherElement: other });
      if (snapX === null || Math.abs(draggedRight - otherRight) < Math.abs(draggedRight - (snapX + draggedElement.width))) {
        snapX = otherRight - draggedElement.width;
      }
    }

    // Left-to-right alignment
    if (Math.abs(draggedLeft - otherRight) < threshold) {
      guides.vertical.push({ x: otherRight, type: 'left-right', otherElement: other });
      if (snapX === null) snapX = otherRight;
    }

    // Right-to-left alignment
    if (Math.abs(draggedRight - otherLeft) < threshold) {
      guides.vertical.push({ x: otherLeft, type: 'right-left', otherElement: other });
      if (snapX === null) snapX = otherLeft - draggedElement.width;
    }

    // Center-to-center (horizontal)
    if (Math.abs(draggedCenterX - otherCenterX) < threshold) {
      guides.vertical.push({ x: otherCenterX, type: 'center', otherElement: other });
      if (snapX === null || Math.abs(draggedCenterX - otherCenterX) < Math.abs(draggedCenterX - (snapX + draggedElement.width / 2))) {
        snapX = otherCenterX - draggedElement.width / 2;
      }
    }

    // Horizontal alignment checks (y-axis)

    // Top-to-top alignment
    if (Math.abs(draggedTop - otherTop) < threshold) {
      guides.horizontal.push({ y: otherTop, type: 'top-top', otherElement: other });
      if (snapY === null || Math.abs(draggedTop - otherTop) < Math.abs(draggedTop - snapY)) {
        snapY = otherTop;
      }
    }

    // Bottom-to-bottom alignment
    if (Math.abs(draggedBottom - otherBottom) < threshold) {
      guides.horizontal.push({ y: otherBottom, type: 'bottom-bottom', otherElement: other });
      if (snapY === null || Math.abs(draggedBottom - otherBottom) < Math.abs(draggedBottom - (snapY + draggedElement.height))) {
        snapY = otherBottom - draggedElement.height;
      }
    }

    // Top-to-bottom alignment
    if (Math.abs(draggedTop - otherBottom) < threshold) {
      guides.horizontal.push({ y: otherBottom, type: 'top-bottom', otherElement: other });
      if (snapY === null) snapY = otherBottom;
    }

    // Bottom-to-top alignment
    if (Math.abs(draggedBottom - otherTop) < threshold) {
      guides.horizontal.push({ y: otherTop, type: 'bottom-top', otherElement: other });
      if (snapY === null) snapY = otherTop - draggedElement.height;
    }

    // Center-to-center (vertical)
    if (Math.abs(draggedCenterY - otherCenterY) < threshold) {
      guides.horizontal.push({ y: otherCenterY, type: 'center', otherElement: other });
      if (snapY === null || Math.abs(draggedCenterY - otherCenterY) < Math.abs(draggedCenterY - (snapY + draggedElement.height / 2))) {
        snapY = otherCenterY - draggedElement.height / 2;
      }
    }
  }

  // Deduplicate guides
  guides.horizontal = deduplicateGuides(guides.horizontal, 'y');
  guides.vertical = deduplicateGuides(guides.vertical, 'x');

  return { guides, snapX, snapY };
}

/**
 * Remove duplicate guides at the same position
 */
function deduplicateGuides(guides, key) {
  const seen = new Set();
  return guides.filter(guide => {
    const value = guide[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Distribute elements evenly
 * @param {Array} elements - Elements to distribute
 * @param {string} direction - 'horizontal' or 'vertical'
 * @returns {Array} - New positions [{id, x, y}]
 */
export function distributeElements(elements, direction = 'horizontal') {
  if (elements.length < 3) return elements.map(el => ({ id: el.id, x: el.x, y: el.y }));

  // Sort by position
  const sorted = [...elements].sort((a, b) =>
    direction === 'horizontal' ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (direction === 'horizontal') {
    const totalWidth = sorted.reduce((sum, el) => sum + el.width, 0);
    const totalSpace = (last.x + last.width) - first.x;
    const gap = (totalSpace - totalWidth) / (sorted.length - 1);

    let currentX = first.x;
    return sorted.map(el => {
      const newX = currentX;
      currentX += el.width + gap;
      return { id: el.id, x: newX, y: el.y };
    });
  } else {
    const totalHeight = sorted.reduce((sum, el) => sum + el.height, 0);
    const totalSpace = (last.y + last.height) - first.y;
    const gap = (totalSpace - totalHeight) / (sorted.length - 1);

    let currentY = first.y;
    return sorted.map(el => {
      const newY = currentY;
      currentY += el.height + gap;
      return { id: el.id, x: el.x, y: newY };
    });
  }
}

/**
 * Align elements to a specific edge or center
 * @param {Array} elements - Elements to align
 * @param {string} alignment - 'left', 'center', 'right', 'top', 'middle', 'bottom'
 * @returns {Array} - New positions [{id, x, y}]
 */
export function alignElements(elements, alignment = 'left') {
  if (elements.length === 0) return [];

  let target;

  switch (alignment) {
    case 'left':
      target = Math.min(...elements.map(el => el.x));
      return elements.map(el => ({ id: el.id, x: target, y: el.y }));

    case 'right':
      target = Math.max(...elements.map(el => el.x + el.width));
      return elements.map(el => ({ id: el.id, x: target - el.width, y: el.y }));

    case 'center':
      const centers = elements.map(el => el.x + el.width / 2);
      target = centers.reduce((a, b) => a + b, 0) / centers.length;
      return elements.map(el => ({ id: el.id, x: target - el.width / 2, y: el.y }));

    case 'top':
      target = Math.min(...elements.map(el => el.y));
      return elements.map(el => ({ id: el.id, x: el.x, y: target }));

    case 'bottom':
      target = Math.max(...elements.map(el => el.y + el.height));
      return elements.map(el => ({ id: el.id, x: el.x, y: target - el.height }));

    case 'middle':
      const middles = elements.map(el => el.y + el.height / 2);
      target = middles.reduce((a, b) => a + b, 0) / middles.length;
      return elements.map(el => ({ id: el.id, x: el.x, y: target - el.height / 2 }));

    default:
      return elements.map(el => ({ id: el.id, x: el.x, y: el.y }));
  }
}
