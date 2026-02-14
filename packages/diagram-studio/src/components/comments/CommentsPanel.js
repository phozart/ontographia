/**
 * CommentsPanel Component
 * Side panel showing all comments with threaded replies
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useComments } from '../../hooks/useCollaboration.js';

/**
 * Single comment item
 */
function CommentItem({
  comment,
  isHighlighted,
  onReply,
  onResolve,
  onDelete,
  onEdit,
  onClick,
  currentUserId,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwner = comment.userId === currentUserId;
  const timeAgo = formatTimeAgo(new Date(comment.createdAt));

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  const containerStyle = {
    padding: 12,
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: isHighlighted ? '#fef3c7' : (comment.resolved ? '#f9fafb' : '#ffffff'),
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  };

  const avatarStyle = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const nameStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  };

  const timeStyle = {
    fontSize: 11,
    color: '#9ca3af',
  };

  const contentStyle = {
    fontSize: 14,
    color: comment.resolved ? '#6b7280' : '#374151',
    lineHeight: 1.5,
    textDecoration: comment.resolved ? 'line-through' : 'none',
  };

  const actionsStyle = {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  };

  const actionButtonStyle = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: 12,
    cursor: 'pointer',
  };

  const inputStyle = {
    width: '100%',
    padding: 8,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    resize: 'none',
    outline: 'none',
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={headerStyle}>
        <div style={userInfoStyle}>
          <div style={avatarStyle}>
            {comment.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={nameStyle}>{comment.user?.name || 'Unknown'}</div>
            <div style={timeStyle}>{timeAgo}</div>
          </div>
        </div>
        {comment.resolved && (
          <span style={{ fontSize: 12, color: '#10b981' }}>✓ Resolved</span>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{ ...inputStyle, marginBottom: 8 }}
            rows={3}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ ...actionButtonStyle, backgroundColor: '#3b82f6', color: '#fff' }}
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              style={actionButtonStyle}
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={contentStyle}>{comment.content}</div>
      )}

      {!isEditing && (
        <div style={actionsStyle}>
          <button style={actionButtonStyle} onClick={() => setShowReplyInput(!showReplyInput)}>
            Reply
          </button>
          {!comment.resolved && (
            <button style={actionButtonStyle} onClick={() => onResolve(comment.id)}>
              Resolve
            </button>
          )}
          {comment.resolved && (
            <button style={actionButtonStyle} onClick={() => onResolve(comment.id)}>
              Unresolve
            </button>
          )}
          {isOwner && (
            <>
              <button style={actionButtonStyle} onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button
                style={{ ...actionButtonStyle, color: '#ef4444' }}
                onClick={() => onDelete(comment.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {showReplyInput && (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            style={inputStyle}
            rows={2}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              style={{ ...actionButtonStyle, backgroundColor: '#3b82f6', color: '#fff' }}
              onClick={handleSubmitReply}
            >
              Reply
            </button>
            <button
              style={actionButtonStyle}
              onClick={() => {
                setShowReplyInput(false);
                setReplyContent('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Comments Panel
 */
export function CommentsPanel({
  boardId,
  currentUserId,
  highlightedCommentId,
  onCommentClick,
  onClose,
}) {
  const {
    comments,
    unresolvedCount,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
  } = useComments(boardId);

  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const inputRef = useRef(null);

  // Group comments by thread (parent comments first)
  const threadedComments = useMemo(() => {
    const parents = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    // Sort by creation time
    parents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Group replies under parents
    return parents.map((parent) => ({
      ...parent,
      replies: replies
        .filter((r) => r.parentId === parent.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
  }, [comments]);

  // Filter comments
  const filteredComments = useMemo(() => {
    switch (filter) {
      case 'open':
        return threadedComments.filter((c) => !c.resolved);
      case 'resolved':
        return threadedComments.filter((c) => c.resolved);
      default:
        return threadedComments;
    }
  }, [threadedComments, filter]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    await addComment(newComment.trim());
    setNewComment('');
    inputRef.current?.focus();
  };

  const handleReply = async (parentId, content) => {
    await addComment(content, { parentId });
  };

  const handleResolve = async (id) => {
    resolveComment(id);
  };

  const handleEdit = async (id, content) => {
    updateComment(id, { content });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this comment?')) {
      deleteComment(id);
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e5e7eb',
  };

  const headerStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  };

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 11,
    fontWeight: 600,
  };

  const closeButtonStyle = {
    padding: 4,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    color: '#6b7280',
  };

  const filterStyle = {
    display: 'flex',
    gap: 4,
    padding: '8px 16px',
    borderBottom: '1px solid #e5e7eb',
  };

  const filterButtonStyle = (isActive) => ({
    padding: '4px 12px',
    border: 'none',
    borderRadius: 16,
    backgroundColor: isActive ? '#3b82f6' : '#f3f4f6',
    color: isActive ? '#ffffff' : '#374151',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  });

  const listStyle = {
    flex: 1,
    overflowY: 'auto',
  };

  const inputContainerStyle = {
    padding: 16,
    borderTop: '1px solid #e5e7eb',
  };

  const textareaStyle = {
    width: '100%',
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    marginBottom: 8,
  };

  const submitButtonStyle = {
    width: '100%',
    padding: 10,
    border: 'none',
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const emptyStyle = {
    padding: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={titleStyle}>Comments</span>
          {unresolvedCount > 0 && (
            <span style={badgeStyle}>{unresolvedCount} open</span>
          )}
        </div>
        {onClose && (
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        )}
      </div>

      <div style={filterStyle}>
        <button
          style={filterButtonStyle(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All ({threadedComments.length})
        </button>
        <button
          style={filterButtonStyle(filter === 'open')}
          onClick={() => setFilter('open')}
        >
          Open ({threadedComments.filter((c) => !c.resolved).length})
        </button>
        <button
          style={filterButtonStyle(filter === 'resolved')}
          onClick={() => setFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      <div style={listStyle}>
        {filteredComments.length === 0 ? (
          <div style={emptyStyle}>
            {filter === 'all' ? 'No comments yet' : `No ${filter} comments`}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                isHighlighted={comment.id === highlightedCommentId}
                currentUserId={currentUserId}
                onReply={(parentId, content) => handleReply(parentId, content)}
                onResolve={handleResolve}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={() => onCommentClick?.(comment)}
              />
              {/* Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} style={{ paddingLeft: 24 }}>
                  <CommentItem
                    comment={reply}
                    isHighlighted={reply.id === highlightedCommentId}
                    currentUserId={currentUserId}
                    onReply={(parentId, content) => handleReply(parentId, content)}
                    onResolve={handleResolve}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={() => onCommentClick?.(reply)}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div style={inputContainerStyle}>
        <textarea
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={textareaStyle}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <button
          style={submitButtonStyle}
          onClick={handleSubmit}
          disabled={!newComment.trim()}
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}

/**
 * Helper: Format time ago
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default CommentsPanel;
