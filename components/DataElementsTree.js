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
  let counter = 0;
  const visitedIds = new Set();
  const treeUid = `tree-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const renderNode = (node, path) => {
    if (!node) return null;
    const nodeId = node.id != null ? String(node.id) : String(path);
    if (!nodeId || visitedIds.has(nodeId)) return null; // guard cycles/empties
    visitedIds.add(nodeId);
    const itemId = `${treeUid}::${nodeId || 'node'}::${path}-${counter++}`;
    const isTypeLevel = path.startsWith('root-') && path.split('-').length === 2;
    if (!idToPath.has(nodeId)) {
      idToPath.set(nodeId, itemId);
    }
    const kids = (childrenMap.get(node.id) || []).filter(child => {
      if (!child || child.id == null) return false;
      return !visitedIds.has(String(child.id));
    });
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
        {kids.map((child, idx) => renderNode(child, `${path}-${idx}`))}
      </TreeItem>
    );
  };

  const treeItems = (elements || []).map((n, idx) => renderNode(n, `root-${idx}`));
  const selectedPath = selectedId && idToPath.get(String(selectedId));

  return (
    <SimpleTreeView
      aria-label="Data elements"
      selectedItems={selectedPath ? [selectedPath] : []}
      defaultExpandedItems={(elements || []).map((n, idx) => `root-${idx}`)}
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
