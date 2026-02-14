// components/portfolio/CommitteeReview.js
// Committee Review - Voting and discussion for initiatives
// "Has this been approved by the governance committee?"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePortfolio } from './PortfolioContext';
import { useAuth } from '../../AuthContext';
import { ViewHeader, ContentArea, Card, Button } from '../../ui';

// MUI Icons
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonIcon from '@mui/icons-material/Person';

import {
  INVESTMENT_HORIZONS,
  PORTFOLIO_STAGES,
} from '../../../lib/portfolio-types';

// Vote button component
function VoteButton({ vote, currentVote, onClick, count, disabled }) {
  const configs = {
    approve: {
      icon: ThumbUpIcon,
      label: 'Approve',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    reject: {
      icon: ThumbDownIcon,
      label: 'Reject',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    abstain: {
      icon: RemoveCircleIcon,
      label: 'Abstain',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1)',
    },
  };

  const config = configs[vote];
  const Icon = config.icon;
  const isActive = currentVote === vote;

  return (
    <button
      className={`vote-button ${isActive ? 'vote-button--active' : ''}`}
      style={{
        '--vote-color': config.color,
        '--vote-bg': config.bgColor,
      }}
      onClick={() => onClick(vote)}
      disabled={disabled}
    >
      <Icon style={{ fontSize: 20, color: isActive ? config.color : 'inherit' }} />
      <span className="vote-button__label">{config.label}</span>
      {count > 0 && <span className="vote-button__count">{count}</span>}
    </button>
  );
}

// Comment component
function Comment({ comment, currentUserId, onReply, onEdit, onDelete, level = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);

  const isOwner = currentUserId === comment.user_id;
  const timeAgo = formatTimeAgo(new Date(comment.created_at));

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleSubmitEdit = () => {
    if (editText.trim() && editText !== comment.content) {
      onEdit(comment.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`comment ${level > 0 ? 'comment--reply' : ''}`} style={{ marginLeft: level * 24 }}>
      <div className="comment__header">
        <PersonIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
        <span className="comment__author">{comment.username || 'Unknown'}</span>
        <span className="comment__time">{timeAgo}</span>
        {comment.updated_at !== comment.created_at && (
          <span className="comment__edited">(edited)</span>
        )}
      </div>

      {isEditing ? (
        <div className="comment__edit">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="comment__textarea"
            rows={2}
          />
          <div className="comment__edit-actions">
            <button className="comment__btn" onClick={handleSubmitEdit}>Save</button>
            <button className="comment__btn comment__btn--cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className="comment__content">{comment.content}</p>
      )}

      <div className="comment__actions">
        <button className="comment__action" onClick={() => setIsReplying(!isReplying)}>
          <ReplyIcon style={{ fontSize: 14 }} /> Reply
        </button>
        {isOwner && (
          <>
            <button className="comment__action" onClick={() => setIsEditing(true)}>
              <EditIcon style={{ fontSize: 14 }} /> Edit
            </button>
            <button className="comment__action comment__action--delete" onClick={() => onDelete(comment.id)}>
              <DeleteIcon style={{ fontSize: 14 }} /> Delete
            </button>
          </>
        )}
      </div>

      {isReplying && (
        <div className="comment__reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="comment__textarea"
            rows={2}
          />
          <div className="comment__reply-actions">
            <button className="comment__btn" onClick={handleSubmitReply} disabled={!replyText.trim()}>
              <SendIcon style={{ fontSize: 14 }} /> Reply
            </button>
            <button className="comment__btn comment__btn--cancel" onClick={() => setIsReplying(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies?.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </div>
  );
}

// Initiative card for selection
function InitiativeCard({ initiative, isSelected, onClick }) {
  const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
  const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];

  return (
    <div
      className={`review-initiative ${isSelected ? 'review-initiative--selected' : ''}`}
      onClick={() => onClick(initiative)}
    >
      <div className="review-initiative__header">
        <span className="review-initiative__horizon" style={{ background: horizon?.color }}>
          {horizon?.shortName || 'H?'}
        </span>
        <span className="review-initiative__stage" style={{ color: stage?.color }}>
          {stage?.name}
        </span>
      </div>
      <div className="review-initiative__name">{initiative.name}</div>
    </div>
  );
}

// Format time ago helper
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function CommitteeReview({ onSelectItem }) {
  const { initiatives } = usePortfolio();
  const { user } = useAuth();
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [votes, setVotes] = useState([]);
  const [voteSummary, setVoteSummary] = useState({ total: 0, approve: 0, reject: 0, abstain: 0, approvalPercent: 0 });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStage, setFilterStage] = useState('all');

  // Filter initiatives that need review (in evaluate or decide stage)
  const reviewableInitiatives = useMemo(() => {
    return initiatives.filter(i => {
      const stage = i.custom_fields?.stage;
      if (filterStage === 'all') return ['evaluate', 'decide'].includes(stage);
      return stage === filterStage;
    });
  }, [initiatives, filterStage]);

  // Fetch votes and comments when initiative changes
  useEffect(() => {
    if (!selectedInitiative) {
      setVotes([]);
      setVoteSummary({ total: 0, approve: 0, reject: 0, abstain: 0, approvalPercent: 0 });
      setComments([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch votes
        const votesRes = await fetch(`/api/portfolio/votes?artefact_id=${selectedInitiative.id}`);
        if (votesRes.ok) {
          const data = await votesRes.json();
          setVotes(data.votes);
          setVoteSummary(data.summary);
        }

        // Fetch comments
        const commentsRes = await fetch(`/api/portfolio/comments?artefact_id=${selectedInitiative.id}`);
        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedInitiative]);

  // Get current user's vote
  const currentUserVote = useMemo(() => {
    if (!user) return null;
    const vote = votes.find(v => v.user_id === user); // user is the username string
    return vote?.vote || null;
  }, [votes, user]);

  // Cast vote
  const handleVote = useCallback(async (vote) => {
    if (!selectedInitiative || !user) return;

    try {
      const res = await fetch('/api/portfolio/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artefact_id: selectedInitiative.id,
          user_id: user, // user is the username string from useAuth
          vote,
        }),
      });

      if (res.ok) {
        const newVote = await res.json();
        setVotes(prev => {
          const existing = prev.findIndex(v => v.user_id === user);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = newVote;
            return updated;
          }
          return [...prev, newVote];
        });

        // Recalculate summary
        setVoteSummary(prev => {
          const newSummary = { ...prev };
          // Remove old vote count if exists
          if (currentUserVote) {
            newSummary[currentUserVote]--;
          } else {
            newSummary.total++;
          }
          // Add new vote count
          newSummary[vote]++;
          newSummary.approvalPercent = newSummary.total > 0
            ? Math.round((newSummary.approve / (newSummary.approve + newSummary.reject)) * 100) || 0
            : 0;
          return newSummary;
        });
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  }, [selectedInitiative, user, currentUserVote]);

  // Add comment
  const handleAddComment = useCallback(async () => {
    if (!selectedInitiative || !user || !newComment.trim()) return;

    try {
      const res = await fetch('/api/portfolio/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artefact_id: selectedInitiative.id,
          user_id: user,
          content: newComment.trim(),
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [selectedInitiative, user, newComment]);

  // Reply to comment
  const handleReply = useCallback(async (parentId, content) => {
    if (!selectedInitiative || !user) return;

    try {
      const res = await fetch('/api/portfolio/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artefact_id: selectedInitiative.id,
          user_id: user,
          content,
          parent_id: parentId,
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        // Add reply to parent comment
        setComments(prev => {
          const addReply = (comments) => {
            return comments.map(c => {
              if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), comment] };
              }
              if (c.replies?.length > 0) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          return addReply(prev);
        });
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }, [selectedInitiative, user]);

  // Edit comment
  const handleEditComment = useCallback(async (commentId, content) => {
    if (!user) return;

    try {
      const res = await fetch('/api/portfolio/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          content,
          user_id: user,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        // Update comment in tree
        setComments(prev => {
          const updateComment = (comments) => {
            return comments.map(c => {
              if (c.id === commentId) {
                return { ...c, content: updated.content, updated_at: updated.updated_at };
              }
              if (c.replies?.length > 0) {
                return { ...c, replies: updateComment(c.replies) };
              }
              return c;
            });
          };
          return updateComment(prev);
        });
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  }, [user]);

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId) => {
    if (!user || !confirm('Delete this comment?')) return;

    try {
      const res = await fetch('/api/portfolio/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          user_id: user,
        }),
      });

      if (res.ok) {
        // Remove comment from tree
        setComments(prev => {
          const removeComment = (comments) => {
            return comments.filter(c => c.id !== commentId).map(c => {
              if (c.replies?.length > 0) {
                return { ...c, replies: removeComment(c.replies) };
              }
              return c;
            });
          };
          return removeComment(prev);
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [user]);

  return (
    <>
      <ViewHeader
        icon={HowToVoteIcon}
        iconColor="#8b5cf6"
        title="Committee Review"
        description="Vote and discuss initiatives for governance decisions"
        count={reviewableInitiatives.length}
      />
      <ContentArea>
        <div className="review-layout">
          {/* Initiative List */}
          <div className="review-list">
            <div className="review-list__header">
              <h3>Initiatives for Review</h3>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="review-list__filter"
              >
                <option value="all">All Stages</option>
                <option value="evaluate">Evaluate</option>
                <option value="decide">Decide</option>
              </select>
            </div>

            {reviewableInitiatives.length === 0 ? (
              <div className="review-list__empty">
                <RocketLaunchIcon style={{ fontSize: 32, color: 'var(--text-muted)' }} />
                <p>No initiatives pending review</p>
              </div>
            ) : (
              <div className="review-list__items">
                {reviewableInitiatives.map(init => (
                  <InitiativeCard
                    key={init.id}
                    initiative={init}
                    isSelected={selectedInitiative?.id === init.id}
                    onClick={setSelectedInitiative}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Review Panel */}
          <div className="review-panel">
            {!selectedInitiative ? (
              <div className="review-panel__empty">
                <HowToVoteIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
                <h3>Select an Initiative</h3>
                <p>Choose an initiative from the list to review and vote</p>
              </div>
            ) : loading ? (
              <div className="review-panel__loading">Loading...</div>
            ) : (
              <>
                {/* Initiative Header */}
                <div className="review-panel__header">
                  <h2>{selectedInitiative.name}</h2>
                  {selectedInitiative.description && (
                    <p className="review-panel__desc">{selectedInitiative.description}</p>
                  )}
                </div>

                {/* Vote Summary */}
                <Card className="review-summary">
                  <div className="review-summary__header">
                    <span className="review-summary__title">Vote Summary</span>
                    <span className={`review-summary__status ${voteSummary.approvalPercent >= 50 ? 'review-summary__status--pass' : 'review-summary__status--fail'}`}>
                      {voteSummary.total === 0 ? (
                        <>
                          <PendingIcon style={{ fontSize: 16 }} />
                          No votes yet
                        </>
                      ) : voteSummary.approvalPercent >= 50 ? (
                        <>
                          <CheckCircleIcon style={{ fontSize: 16 }} />
                          {voteSummary.approvalPercent}% Approval
                        </>
                      ) : (
                        <>
                          <CancelIcon style={{ fontSize: 16 }} />
                          {voteSummary.approvalPercent}% Approval
                        </>
                      )}
                    </span>
                  </div>

                  <div className="review-summary__bar">
                    <div
                      className="review-summary__bar-approve"
                      style={{ width: `${voteSummary.total > 0 ? (voteSummary.approve / voteSummary.total) * 100 : 0}%` }}
                    />
                    <div
                      className="review-summary__bar-reject"
                      style={{ width: `${voteSummary.total > 0 ? (voteSummary.reject / voteSummary.total) * 100 : 0}%` }}
                    />
                    <div
                      className="review-summary__bar-abstain"
                      style={{ width: `${voteSummary.total > 0 ? (voteSummary.abstain / voteSummary.total) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="review-summary__counts">
                    <span className="review-summary__count review-summary__count--approve">
                      <ThumbUpIcon style={{ fontSize: 14 }} /> {voteSummary.approve}
                    </span>
                    <span className="review-summary__count review-summary__count--reject">
                      <ThumbDownIcon style={{ fontSize: 14 }} /> {voteSummary.reject}
                    </span>
                    <span className="review-summary__count review-summary__count--abstain">
                      <RemoveCircleIcon style={{ fontSize: 14 }} /> {voteSummary.abstain}
                    </span>
                    <span className="review-summary__total">
                      {voteSummary.total} vote{voteSummary.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Card>

                {/* Voting Buttons */}
                {user && (
                  <div className="review-voting">
                    <h4>Cast Your Vote</h4>
                    <div className="review-voting__buttons">
                      <VoteButton
                        vote="approve"
                        currentVote={currentUserVote}
                        onClick={handleVote}
                        count={voteSummary.approve}
                      />
                      <VoteButton
                        vote="reject"
                        currentVote={currentUserVote}
                        onClick={handleVote}
                        count={voteSummary.reject}
                      />
                      <VoteButton
                        vote="abstain"
                        currentVote={currentUserVote}
                        onClick={handleVote}
                        count={voteSummary.abstain}
                      />
                    </div>
                  </div>
                )}

                {/* Voter List */}
                {votes.length > 0 && (
                  <div className="review-voters">
                    <h4>Votes</h4>
                    <div className="review-voters__list">
                      {votes.map(vote => (
                        <div key={vote.id} className={`review-voter review-voter--${vote.vote}`}>
                          <PersonIcon style={{ fontSize: 16 }} />
                          <span className="review-voter__name">{vote.username}</span>
                          <span className={`review-voter__vote review-voter__vote--${vote.vote}`}>
                            {vote.vote === 'approve' && <ThumbUpIcon style={{ fontSize: 14 }} />}
                            {vote.vote === 'reject' && <ThumbDownIcon style={{ fontSize: 14 }} />}
                            {vote.vote === 'abstain' && <RemoveCircleIcon style={{ fontSize: 14 }} />}
                            {vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)}
                          </span>
                          {vote.comment && (
                            <span className="review-voter__comment">{vote.comment}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discussion */}
                <div className="review-discussion">
                  <h4>
                    <CommentIcon style={{ fontSize: 18 }} />
                    Discussion ({comments.length})
                  </h4>

                  {/* New Comment Form */}
                  {user && (
                    <div className="review-discussion__form">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="review-discussion__input"
                        rows={3}
                      />
                      <button
                        className="review-discussion__submit"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <SendIcon style={{ fontSize: 16 }} />
                        Post Comment
                      </button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="review-discussion__comments">
                    {comments.length === 0 ? (
                      <p className="review-discussion__empty">No comments yet. Start the discussion!</p>
                    ) : (
                      comments.map(comment => (
                        <Comment
                          key={comment.id}
                          comment={comment}
                          currentUserId={user?.id}
                          onReply={handleReply}
                          onEdit={handleEditComment}
                          onDelete={handleDeleteComment}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ContentArea>

      <style jsx>{`
        .review-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          min-height: 500px;
        }

        .review-list {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .review-list__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .review-list__header h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .review-list__filter {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 0.75rem;
        }

        .review-list__items {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .review-list__empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }

        .review-list__empty p {
          margin: 8px 0 0;
          font-size: 0.875rem;
        }

        .review-initiative {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .review-initiative:hover {
          background: var(--bg-hover);
        }

        .review-initiative--selected {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .review-initiative__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .review-initiative__horizon {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          color: white;
        }

        .review-initiative__stage {
          font-size: 0.6875rem;
          font-weight: 500;
        }

        .review-initiative__name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1.3;
        }

        .review-panel {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }

        .review-panel__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          text-align: center;
          color: var(--text-muted);
        }

        .review-panel__empty h3 {
          margin: 16px 0 8px;
          color: var(--text);
        }

        .review-panel__empty p {
          margin: 0;
          font-size: 0.875rem;
        }

        .review-panel__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: var(--text-muted);
        }

        .review-panel__header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .review-panel__header h2 {
          margin: 0 0 8px;
          font-size: 1.25rem;
        }

        .review-panel__desc {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .review-voting {
          margin-bottom: 24px;
        }

        .review-voting h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .review-voting__buttons {
          display: flex;
          gap: 12px;
        }

        .review-voters {
          margin-bottom: 24px;
        }

        .review-voters h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .review-voters__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .review-voter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 0.8125rem;
        }

        .review-voter__name {
          font-weight: 500;
        }

        .review-voter__vote {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .review-voter__vote--approve {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .review-voter__vote--reject {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .review-voter__vote--abstain {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .review-voter__comment {
          flex: 1;
          color: var(--text-muted);
          font-style: italic;
        }

        .review-discussion {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .review-discussion h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .review-discussion__form {
          margin-bottom: 16px;
        }

        .review-discussion__input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 0.875rem;
          resize: vertical;
          margin-bottom: 8px;
        }

        .review-discussion__submit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #8b5cf6;
          color: white;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .review-discussion__submit:hover {
          background: #7c3aed;
        }

        .review-discussion__submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-discussion__empty {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
          padding: 24px;
        }
      `}</style>

      <style jsx global>{`
        .review-summary {
          margin-bottom: 24px;
        }

        .review-summary__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .review-summary__title {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .review-summary__status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .review-summary__status--pass {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .review-summary__status--fail {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .review-summary__bar {
          display: flex;
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .review-summary__bar-approve {
          background: #10b981;
          transition: width 0.3s ease;
        }

        .review-summary__bar-reject {
          background: #ef4444;
          transition: width 0.3s ease;
        }

        .review-summary__bar-abstain {
          background: #6b7280;
          transition: width 0.3s ease;
        }

        .review-summary__counts {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .review-summary__count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .review-summary__count--approve {
          color: #10b981;
        }

        .review-summary__count--reject {
          color: #ef4444;
        }

        .review-summary__count--abstain {
          color: #6b7280;
        }

        .review-summary__total {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .vote-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          color: var(--text);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .vote-button:hover {
          border-color: var(--vote-color);
          background: var(--vote-bg);
        }

        .vote-button--active {
          border-color: var(--vote-color);
          background: var(--vote-bg);
        }

        .vote-button__count {
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 10px;
          font-size: 0.75rem;
        }

        .comment {
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .comment--reply {
          background: transparent;
          border-left: 2px solid var(--border);
          border-radius: 0;
          padding-left: 12px;
        }

        .comment__header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 0.75rem;
        }

        .comment__author {
          font-weight: 600;
          color: var(--text);
        }

        .comment__time {
          color: var(--text-muted);
        }

        .comment__edited {
          color: var(--text-muted);
          font-style: italic;
        }

        .comment__content {
          margin: 0 0 8px;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--text);
        }

        .comment__actions {
          display: flex;
          gap: 12px;
        }

        .comment__action {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .comment__action:hover {
          color: var(--text);
        }

        .comment__action--delete:hover {
          color: #ef4444;
        }

        .comment__reply-form,
        .comment__edit {
          margin-top: 12px;
        }

        .comment__textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 0.8125rem;
          resize: vertical;
          margin-bottom: 8px;
        }

        .comment__reply-actions,
        .comment__edit-actions {
          display: flex;
          gap: 8px;
        }

        .comment__btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: #8b5cf6;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .comment__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comment__btn--cancel {
          background: var(--bg-hover);
          color: var(--text);
        }
      `}</style>
    </>
  );
}
