import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';

export default function DataElementsTree({
  elements,
  childrenMap,
  selectedId,
  onSelect,
  getLabel,
}) {
  const idToPath = new Map();
  const visitedIds = new Set();
  let renderCount = 0;
  const treeUid = `tree-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const getChildren = nodeId => {
    if (!childrenMap) return [];
    if (typeof childrenMap.get === 'function') return childrenMap.get(nodeId) || [];
    if (typeof childrenMap === 'object') return childrenMap[nodeId] || [];
    return [];
  };

  const renderNode = (node, path, depth = 0) => {
    if (!node || depth > 200) return null; // hard guard against runaway depth
    renderCount += 1;
    if (renderCount > 2000) return null; // soft cap total nodes to avoid runaway render
    const nodeId = node.id != null ? String(node.id) : String(path);
    if (!nodeId || visitedIds.has(nodeId)) return null; // guard cycles/empties
    visitedIds.add(nodeId);
    const itemId = `${treeUid}::${nodeId}::${path}`;
    const isTypeLevel = depth === 0;
    if (!idToPath.has(nodeId)) {
      idToPath.set(nodeId, itemId);
    }
    const children = getChildren(node.id)
      .filter(child => child && child.id != null && String(child.id) !== nodeId)
      .filter(child => !visitedIds.has(String(child.id)));
    const label = (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2" fontWeight={isTypeLevel ? 700 : 500}>
          {getLabel(node)}
        </Typography>
        {node.attributes?.mandatory ? <Chip size="small" color="error" label="Mandatory" /> : null}
      </Box>
    );
    return (
      <TreeItem key={itemId} itemId={itemId} label={label}>
        {children.map((child, idx) => renderNode(child, `${path}-${idx}`, depth + 1))}
      </TreeItem>
    );
  };

  const treeItems = (elements || []).map((n, idx) => renderNode(n, `root-${idx}`, 0));
  const rootIds = treeItems
    .map(item => item?.props?.itemId)
    .filter(Boolean);
  const selectedPath = selectedId && idToPath.get(String(selectedId));

  return (
    <SimpleTreeView
      aria-label="Data elements"
      selectedItems={selectedPath ? [selectedPath] : []}
      defaultExpandedItems={rootIds}
      onSelectedItemsChange={(_, ids) => {
        const last = Array.isArray(ids) ? ids[ids.length - 1] : ids;
        if (last) {
          const parts = String(last).split('::');
          const nodeId = parts[1] || parts[0];
          if (nodeId) onSelect(nodeId);
        }
      }}
      slots={{
        collapseIcon: ExpandMore,
        expandIcon: ChevronRight,
      }}
      sx={{ flex: 1, overflowY: 'auto', minHeight: 0, '& .MuiTreeItem-label': { py: 0.5 } }}
    >
      {treeItems}
    </SimpleTreeView>
  );
}
