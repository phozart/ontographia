// components/ba/DocumentEditor.js
// Block-based document editor (Notion-like)

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  CalloutBlock,
  ArtefactBlock,
  ArtefactTableBlock,
  DiagramBlock,
  BLOCK_TYPES,
  BLOCK_CATEGORIES,
  getDefaultBlockContent,
} from './blocks';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Generate unique ID
const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ BLOCK WRAPPER ============
function BlockWrapper({
  block,
  index,
  totalBlocks,
  isEditing,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onAddBlock,
  onSelectArtefact,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleContentChange = (newContent) => {
    onUpdate(block.id, { ...block, content: newContent });
  };

  const renderBlock = () => {
    const props = {
      content: block.content,
      onChange: handleContentChange,
      onDelete: () => onDelete(block.id),
      onAddBlock: (type) => onAddBlock(index + 1, type),
      isEditing,
      onSelectArtefact,
    };

    switch (block.type) {
      case 'heading':
        return <HeadingBlock {...props} />;
      case 'paragraph':
        return <ParagraphBlock {...props} />;
      case 'list':
        return <ListBlock {...props} />;
      case 'table':
        return <TableBlock {...props} />;
      case 'callout':
        return <CalloutBlock {...props} />;
      case 'artefact':
        return <ArtefactBlock {...props} />;
      case 'artefactTable':
        return <ArtefactTableBlock {...props} />;
      case 'diagram':
        return <DiagramBlock {...props} />;
      default:
        return <div className="block-unknown">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div className={`block-wrapper ${isEditing ? 'editing' : ''}`}>
      {/* Block Controls */}
      {isEditing && (
        <div className="block-controls">
          <button
            className="block-control-btn add-btn"
            onClick={() => setShowAddMenu(!showAddMenu)}
            title="Add block"
          >
            <AddIcon fontSize="small" />
          </button>
          <button
            className="block-control-btn drag-btn"
            title="Drag to reorder"
          >
            <DragIndicatorIcon fontSize="small" />
          </button>
          <button
            className="block-control-btn menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            title="More options"
          >
            <MoreVertIcon fontSize="small" />
          </button>

          {/* Block Menu */}
          {showMenu && (
            <div className="block-menu">
              <button onClick={() => { onMoveUp(block.id); setShowMenu(false); }} disabled={index === 0}>
                <ArrowUpwardIcon fontSize="small" /> Move up
              </button>
              <button onClick={() => { onMoveDown(block.id); setShowMenu(false); }} disabled={index === totalBlocks - 1}>
                <ArrowDownwardIcon fontSize="small" /> Move down
              </button>
              <button onClick={() => { onDuplicate(block.id); setShowMenu(false); }}>
                <ContentCopyIcon fontSize="small" /> Duplicate
              </button>
              <button onClick={() => { onDelete(block.id); setShowMenu(false); }} className="delete-btn">
                <DeleteIcon fontSize="small" /> Delete
              </button>
            </div>
          )}

          {/* Add Block Menu */}
          {showAddMenu && (
            <div className="add-block-menu">
              {Object.entries(BLOCK_CATEGORIES)
                .sort((a, b) => a[1].order - b[1].order)
                .map(([catKey, cat]) => (
                  <div key={catKey} className="add-block-category">
                    <div className="category-label">{cat.name}</div>
                    {Object.values(BLOCK_TYPES)
                      .filter((bt) => bt.category === catKey)
                      .map((bt) => (
                        <button
                          key={bt.id}
                          className="add-block-option"
                          onClick={() => {
                            onAddBlock(index + 1, bt.id);
                            setShowAddMenu(false);
                          }}
                        >
                          <span className="block-icon">{bt.icon}</span>
                          <span className="block-name">{bt.name}</span>
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Block Content */}
      <div className="block-content">
        {renderBlock()}
      </div>
    </div>
  );
}

// ============ DOCUMENT EDITOR ============
export default function DocumentEditor({
  document,
  onSave,
  isEditing = true,
  onSelectArtefact,
}) {
  const [blocks, setBlocks] = useState(() => {
    // Parse document content
    if (document?.content) {
      try {
        const parsed = typeof document.content === 'string'
          ? JSON.parse(document.content)
          : document.content;
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [title, setTitle] = useState(document?.title || '');
  const [hasChanges, setHasChanges] = useState(false);

  // Update blocks and mark as changed
  const updateBlocks = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    setHasChanges(true);
  }, []);

  // Add a new block
  const handleAddBlock = useCallback((index, type) => {
    const newBlock = {
      id: generateBlockId(),
      type,
      content: getDefaultBlockContent(type),
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    updateBlocks(newBlocks);
  }, [blocks, updateBlocks]);

  // Update a block
  const handleUpdateBlock = useCallback((blockId, updatedBlock) => {
    updateBlocks(blocks.map((b) => (b.id === blockId ? updatedBlock : b)));
  }, [blocks, updateBlocks]);

  // Delete a block
  const handleDeleteBlock = useCallback((blockId) => {
    updateBlocks(blocks.filter((b) => b.id !== blockId));
  }, [blocks, updateBlocks]);

  // Move block up
  const handleMoveUp = useCallback((blockId) => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      updateBlocks(newBlocks);
    }
  }, [blocks, updateBlocks]);

  // Move block down
  const handleMoveDown = useCallback((blockId) => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      updateBlocks(newBlocks);
    }
  }, [blocks, updateBlocks]);

  // Duplicate block
  const handleDuplicate = useCallback((blockId) => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index !== -1) {
      const newBlock = {
        ...blocks[index],
        id: generateBlockId(),
        content: { ...blocks[index].content },
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      updateBlocks(newBlocks);
    }
  }, [blocks, updateBlocks]);

  // Save document
  const handleSave = useCallback(() => {
    onSave?.({
      title,
      content: blocks,
    });
    setHasChanges(false);
  }, [title, blocks, onSave]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  return (
    <div className="document-editor" onKeyDown={handleKeyDown}>
      {/* Document Header */}
      <div className="document-editor-header">
        {isEditing ? (
          <input
            type="text"
            className="document-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Document title..."
          />
        ) : (
          <h1 className="document-title">{title || 'Untitled Document'}</h1>
        )}

        {isEditing && (
          <div className="document-editor-actions">
            {hasChanges && <span className="unsaved-indicator">Unsaved changes</span>}
            <button className="save-btn" onClick={handleSave} disabled={!hasChanges}>
              Save
            </button>
          </div>
        )}
      </div>

      {/* Document Content */}
      <div className="document-editor-content">
        {blocks.length === 0 ? (
          <div className="document-empty">
            {isEditing ? (
              <>
                <p>Start building your document</p>
                <div className="empty-actions">
                  <button onClick={() => handleAddBlock(0, 'heading')}>
                    Add Heading
                  </button>
                  <button onClick={() => handleAddBlock(0, 'paragraph')}>
                    Add Paragraph
                  </button>
                  <button onClick={() => handleAddBlock(0, 'table')}>
                    Add Table
                  </button>
                  <button onClick={() => handleAddBlock(0, 'artefactTable')}>
                    Add Artefact Table
                  </button>
                </div>
              </>
            ) : (
              <p>This document is empty</p>
            )}
          </div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <BlockWrapper
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                isEditing={isEditing}
                onUpdate={handleUpdateBlock}
                onDelete={handleDeleteBlock}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDuplicate={handleDuplicate}
                onAddBlock={handleAddBlock}
                onSelectArtefact={onSelectArtefact}
              />
            ))}

            {/* Add block button at the end */}
            {isEditing && (
              <div className="add-block-footer">
                <AddBlockButton onAdd={(type) => handleAddBlock(blocks.length, type)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============ ADD BLOCK BUTTON ============
function AddBlockButton({ onAdd }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="add-block-container">
      <button
        className="add-block-btn"
        onClick={() => setShowMenu(!showMenu)}
      >
        <AddIcon fontSize="small" />
        <span>Add block</span>
      </button>

      {showMenu && (
        <div className="add-block-menu bottom">
          {Object.entries(BLOCK_CATEGORIES)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([catKey, cat]) => (
              <div key={catKey} className="add-block-category">
                <div className="category-label">{cat.name}</div>
                {Object.values(BLOCK_TYPES)
                  .filter((bt) => bt.category === catKey)
                  .map((bt) => (
                    <button
                      key={bt.id}
                      className="add-block-option"
                      onClick={() => {
                        onAdd(bt.id);
                        setShowMenu(false);
                      }}
                    >
                      <span className="block-icon">{bt.icon}</span>
                      <div className="block-info">
                        <span className="block-name">{bt.name}</span>
                        <span className="block-desc">{bt.description}</span>
                      </div>
                    </button>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
