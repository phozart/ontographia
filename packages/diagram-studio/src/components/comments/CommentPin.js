/**
 * CommentPin Component
 * Displays comment markers on the canvas
 */

import React, { useState, useMemo } from 'react';
import { useComments } from '../../hooks/useCollaboration.js';

/**
 * Single comment pin
 */
function Pin({ comment, isSelected, onClick, scale = 1 }) {
  const [isHovered, setIsHovered] = useState(false);

  const position = comment.anchorPosition || { x: 0, y: 0 };
  const hasUnread = !comment.resolved;
  const replyCount = 0; // Would come from threaded data

  const containerStyle = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -100%) scale(${1 / scale})`,
    transformOrigin: 'bottom center',
    cursor: 'pointer',
    zIndex: isSelected || isHovered ? 1000 : 100,
  };

  const pinStyle = {
    width: 28,
    height: 34,
    position: 'relative',
  };

  const bubbleStyle = {
    width: 28,
    height: 28,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: isSelected ? '#3b82f6' : (hasUnread ? '#f59e0b' : '#6b7280'),
    border: `2px solid ${isSelected ? '#2563eb' : '#ffffff'}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-45deg)',
    transition: 'all 0.15s',
  };

  const innerStyle = {
    transform: 'rotate(45deg)',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 8,
    padding: '8px 12px',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: 6,
    fontSize: 12,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    opacity: isHovered ? 1 : 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s',
  };

  const badgeStyle = {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={pinStyle}>
        <div style={bubbleStyle}>
          <span style={innerStyle}>💬</span>
        </div>
        {replyCount > 0 && (
          <div style={badgeStyle}>{replyCount}</div>
        )}
      </div>
      <div style={tooltipStyle}>
        <strong>{comment.user?.name}: </strong>
        {comment.content.slice(0, 50)}
        {comment.content.length > 50 ? '...' : ''}
      </div>
    </div>
  );
}

/**
 * Comment pins layer for canvas
 */
export function CommentPins({
  boardId,
  scale = 1,
  selectedCommentId,
  onCommentSelect,
  onAddComment,
}) {
  const { comments, getCommentsAtPosition } = useComments(boardId);

  // Get position-anchored comments
  const positionComments = useMemo(
    () => comments.filter((c) => c.anchorType === 'position' && c.anchorPosition),
    [comments]
  );

  const containerStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  };

  const pinWrapperStyle = {
    pointerEvents: 'auto',
  };

  return (
    <div style={containerStyle}>
      {positionComments.map((comment) => (
        <div key={comment.id} style={pinWrapperStyle}>
          <Pin
            comment={comment}
            isSelected={comment.id === selectedCommentId}
            onClick={() => onCommentSelect?.(comment)}
            scale={scale}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Element comment indicator (for element-anchored comments)
 */
export function ElementCommentBadge({ elementId, boardId, onClick, scale = 1 }) {
  const { getCommentsForElement } = useComments(boardId);

  const elementComments = useMemo(
    () => getCommentsForElement(elementId),
    [getCommentsForElement, elementId]
  );

  const unresolvedCount = elementComments.filter((c) => !c.resolved).length;

  if (elementComments.length === 0) return null;

  const badgeStyle = {
    position: 'absolute',
    top: -8 / scale,
    right: -8 / scale,
    width: 20 / scale,
    height: 20 / scale,
    borderRadius: '50%',
    backgroundColor: unresolvedCount > 0 ? '#f59e0b' : '#6b7280',
    color: '#ffffff',
    fontSize: 10 / scale,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid #ffffff`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  };

  return (
    <div style={badgeStyle} onClick={onClick}>
      {elementComments.length}
    </div>
  );
}

/**
 * Comment creation popover
 */
export function CommentCreator({
  position,
  onSubmit,
  onCancel,
  scale = 1,
}) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), position);
      setContent('');
    }
  };

  const containerStyle = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: `scale(${1 / scale})`,
    transformOrigin: 'top left',
    zIndex: 1001,
  };

  const popoverStyle = {
    width: 280,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb',
  };

  const textareaStyle = {
    width: '100%',
    padding: 8,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    marginBottom: 8,
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  };

  const buttonStyle = (primary) => ({
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? '#ffffff' : '#374151',
  });

  return (
    <div style={containerStyle}>
      <div style={popoverStyle}>
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          style={textareaStyle}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <div style={buttonContainerStyle}>
          <button style={buttonStyle(false)} onClick={onCancel}>
            Cancel
          </button>
          <button
            style={buttonStyle(true)}
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentPins;
