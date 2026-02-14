/**
 * WBSTree.js
 *
 * Work Breakdown Structure tree view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function WBSTree({ onCreateArtefact }) {
  const { getArtefactsByType } = useProjectStudio();

  const wbsItems = useMemo(() => getArtefactsByType('wbs_item'), [getArtefactsByType]);

  // Build tree structure
  const tree = useMemo(() => {
    const rootItems = wbsItems.filter(item => !item.custom_fields?.parent_id);
    return rootItems.sort((a, b) => (a.custom_fields?.wbs_code || '').localeCompare(b.custom_fields?.wbs_code || ''));
  }, [wbsItems]);

  const renderWBSItem = (item, level = 0) => {
    const children = wbsItems.filter(i => i.custom_fields?.parent_id === item.id);
    const hasChildren = children.length > 0;

    return (
      <div key={item.id} className="wbs-item" style={{ marginLeft: `${level * 24}px` }}>
        <div className="wbs-item-header">
          {hasChildren ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" style={{ opacity: 0.3 }} />
          )}
          <span className="wbs-code">{item.custom_fields?.wbs_code || '-'}</span>
          <span className="wbs-name">{item.name}</span>
          <span className={`wbs-status wbs-status--${item.custom_fields?.status}`}>
            {item.custom_fields?.status?.replace(/_/g, ' ')}
          </span>
          <span className="wbs-progress">{item.custom_fields?.progress || 0}%</span>
        </div>
        {hasChildren && (
          <div className="wbs-children">
            {children.map(child => renderWBSItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ViewHeader
        icon={AccountTreeIcon}
        iconColor="#3b82f6"
        title="Work Breakdown Structure"
        description="Decompose project scope into deliverables"
        count={wbsItems.length}
        createLabel="Add WBS Item"
        onCreate={() => onCreateArtefact?.('wbs_item')}
      />
      <ContentArea>
        <div className="wbs-tree">
          {wbsItems.length === 0 ? (
            <EmptyState
              icon={AccountTreeIcon}
              iconColor="#3b82f6"
              title="No WBS Items Yet"
              description="Break down your project into manageable work packages."
              actionLabel="Add WBS Item"
              onAction={() => onCreateArtefact?.('wbs_item')}
            />
          ) : (
            <Card>
              <Card.Header>
                <span>Work Breakdown Structure</span>
              </Card.Header>
              <Card.Section>
                <div className="wbs-container">
                  {tree.map(item => renderWBSItem(item))}
                </div>
              </Card.Section>
            </Card>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('wbs_item')}>
              <AddIcon fontSize="small" />
              Add WBS Item
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
