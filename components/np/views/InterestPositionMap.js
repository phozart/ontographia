// components/np/views/InterestPositionMap.js
// Distinguish positions from underlying interests

import { useState, useCallback, useMemo } from 'react';
import { useNP } from '../NPContext';

export default function InterestPositionMap() {
  const {
    currentSituation,
    elements,
    createElement,
    updateElement,
    deleteElement,
    createRelationship,
    relationships,
    lens
  } = useNP();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState('position');
  const [addParty, setAddParty] = useState('mine');
  const [content, setContent] = useState('');
  const [confidence, setConfidence] = useState('assumption');
  const [linkingFrom, setLinkingFrom] = useState(null);

  // Get positions and interests
  const positions = useMemo(() =>
    elements.filter(e => e.element_type === 'position'),
    [elements]
  );

  const interests = useMemo(() =>
    elements.filter(e => e.element_type === 'interest'),
    [elements]
  );

  // Get relationships between positions and interests
  const positionInterestLinks = useMemo(() =>
    relationships.filter(r =>
      r.relationship_type === 'addresses' ||
      r.relationship_type === 'supports'
    ),
    [relationships]
  );

  // Find linked interests for a position
  const getLinkedInterests = (positionId) => {
    return positionInterestLinks
      .filter(r => r.from_element_id === positionId)
      .map(r => interests.find(i => i.id === r.to_element_id))
      .filter(Boolean);
  };

  // Find unlinked interests
  const unlinkedInterests = useMemo(() => {
    const linkedIds = new Set(positionInterestLinks.map(r => r.to_element_id));
    return interests.filter(i => !linkedIds.has(i.id));
  }, [interests, positionInterestLinks]);

  const handleCreate = useCallback(async () => {
    if (!content.trim()) return;

    const newElem = await createElement({
      element_type: addType,
      category: 'perspective',
      party: addParty,
      content: content.trim(),
      confidence: addParty === 'mine' ? 'known' : confidence
    });

    // If linking from a position, create the relationship
    if (linkingFrom && addType === 'interest') {
      await createRelationship({
        from_element_id: linkingFrom,
        to_element_id: newElem.id,
        relationship_type: 'addresses'
      });
    }

    setContent('');
    setShowAddForm(false);
    setLinkingFrom(null);
  }, [createElement, createRelationship, addType, addParty, content, confidence, linkingFrom]);

  const handleLinkInterest = useCallback(async (positionId, interestId) => {
    await createRelationship({
      from_element_id: positionId,
      to_element_id: interestId,
      relationship_type: 'addresses'
    });
  }, [createRelationship]);

  const startAddInterestForPosition = (positionId) => {
    setLinkingFrom(positionId);
    setAddType('interest');
    setAddParty(positions.find(p => p.id === positionId)?.party || 'mine');
    setShowAddForm(true);
  };

  const renderPositionCard = (position, side) => {
    const linkedInterests = getLinkedInterests(position.id);
    const isMyPosition = position.party === 'mine';

    return (
      <div key={position.id} className={`np-position-card np-party-${position.party}`}>
        <div className="np-position-header">
          <span className="np-position-label">Position</span>
          {!isMyPosition && (
            <span className={`np-confidence-badge np-conf-${position.confidence}`}>
              {position.confidence}
            </span>
          )}
        </div>
        <p className="np-position-content">{position.content}</p>

        <div className="np-interests-section">
          <h5>Why? (Underlying Interests)</h5>
          {linkedInterests.length > 0 ? (
            <div className="np-linked-interests">
              {linkedInterests.map(interest => (
                <div key={interest.id} className={`np-interest-chip np-conf-${interest.confidence}`}>
                  <span>{interest.content}</span>
                  {!isMyPosition && (
                    <span className="np-chip-conf" title={interest.confidence}>
                      {interest.confidence === 'known' ? '✓' : '?'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="np-no-interests">No interests linked yet</p>
          )}

          <div className="np-interest-actions">
            <button
              className="np-link-btn"
              onClick={() => startAddInterestForPosition(position.id)}
            >
              + Add Interest
            </button>
            {unlinkedInterests.filter(i => i.party === position.party).length > 0 && (
              <select
                className="np-link-existing"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleLinkInterest(position.id, e.target.value);
                  }
                }}
              >
                <option value="">Link existing...</option>
                {unlinkedInterests
                  .filter(i => i.party === position.party)
                  .map(i => (
                    <option key={i.id} value={i.id}>{i.content}</option>
                  ))
                }
              </select>
            )}
          </div>
        </div>

        <button
          className="np-delete-btn"
          onClick={() => deleteElement(position.id)}
          title="Delete position"
        >
          ×
        </button>
      </div>
    );
  };

  if (!currentSituation) return null;

  const myPositions = positions.filter(p => p.party === 'mine');
  const theirPositions = positions.filter(p => p.party === 'theirs');
  const sharedPositions = positions.filter(p => p.party === 'shared');

  return (
    <div className="np-interest-position-map">
      <div className="np-map-header">
        <h2>Interests vs Positions</h2>
        <p>
          <strong>Positions</strong> are what people say they want.
          <strong> Interests</strong> are why they want it.
          <span className="np-insight"> Finding shared interests unlocks creative solutions.</span>
        </p>
      </div>

      {/* Key Insight Box */}
      <div className="np-insight-box">
        <h4>Key Negotiation Principle</h4>
        <p>
          "We want the corner office" (position) vs "We need natural light for team morale" (interest).
          Understanding interests reveals solutions that positions alone cannot.
        </p>
      </div>

      <div className={`np-positions-grid np-lens-${lens}`}>
        {/* My Positions */}
        {(lens === 'mine' || lens === 'balanced') && (
          <div className="np-positions-column np-column-mine">
            <div className="np-column-header">
              <h3>My Positions & Interests</h3>
              <button
                className="np-add-btn"
                onClick={() => {
                  setAddType('position');
                  setAddParty('mine');
                  setShowAddForm(true);
                }}
              >
                + Position
              </button>
            </div>

            {myPositions.length === 0 ? (
              <div className="np-empty-state">
                <p>What are you asking for in this situation?</p>
                <button onClick={() => {
                  setAddType('position');
                  setAddParty('mine');
                  setShowAddForm(true);
                }}>
                  Add your first position
                </button>
              </div>
            ) : (
              myPositions.map(p => renderPositionCard(p, 'mine'))
            )}
          </div>
        )}

        {/* Shared Interests (center) */}
        {lens === 'balanced' && (
          <div className="np-shared-interests">
            <h3>Shared Interests</h3>
            <p className="np-shared-hint">
              What do you both want? Where might your interests align?
            </p>
            {sharedPositions.length > 0 || interests.filter(i => i.party === 'shared').length > 0 ? (
              <div className="np-shared-list">
                {interests.filter(i => i.party === 'shared').map(interest => (
                  <div key={interest.id} className="np-shared-item">
                    {interest.content}
                  </div>
                ))}
              </div>
            ) : (
              <button
                className="np-find-shared-btn"
                onClick={() => {
                  setAddType('interest');
                  setAddParty('shared');
                  setShowAddForm(true);
                }}
              >
                + Identify shared interest
              </button>
            )}
          </div>
        )}

        {/* Their Positions */}
        {(lens === 'theirs' || lens === 'balanced') && (
          <div className="np-positions-column np-column-theirs">
            <div className="np-column-header">
              <h3>Their Positions & Interests</h3>
              <button
                className="np-add-btn"
                onClick={() => {
                  setAddType('position');
                  setAddParty('theirs');
                  setShowAddForm(true);
                }}
              >
                + Position
              </button>
            </div>

            {theirPositions.length === 0 ? (
              <div className="np-empty-state">
                <p>What are they asking for? (Even if uncertain)</p>
                <button onClick={() => {
                  setAddType('position');
                  setAddParty('theirs');
                  setShowAddForm(true);
                }}>
                  Add their position
                </button>
              </div>
            ) : (
              theirPositions.map(p => renderPositionCard(p, 'theirs'))
            )}
          </div>
        )}
      </div>

      {/* Floating Unlinked Interests */}
      {unlinkedInterests.length > 0 && (
        <div className="np-unlinked-interests">
          <h4>Unlinked Interests</h4>
          <p>These interests aren't connected to any position yet. Can you identify what position they support?</p>
          <div className="np-unlinked-list">
            {unlinkedInterests.map(interest => (
              <div key={interest.id} className={`np-unlinked-item np-party-${interest.party}`}>
                <span>{interest.content}</span>
                <span className="np-party-label">{interest.party}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="np-modal-overlay" onClick={() => {
          setShowAddForm(false);
          setLinkingFrom(null);
        }}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>
            <h2>
              Add {addParty === 'mine' ? 'My' : addParty === 'theirs' ? 'Their' : 'Shared'} {addType === 'position' ? 'Position' : 'Interest'}
            </h2>

            {linkingFrom && (
              <p className="np-linking-context">
                Adding interest for: "{positions.find(p => p.id === linkingFrom)?.content}"
              </p>
            )}

            <div className="np-form-group">
              <label>{addType === 'position' ? 'What are you/they asking for?' : 'Why do you/they want this?'}</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={addType === 'position'
                  ? 'e.g., "I want a 15% raise"'
                  : 'e.g., "I need to feel valued for my contributions"'
                }
                rows={3}
                autoFocus
              />
            </div>

            {addParty === 'theirs' && (
              <div className="np-form-group">
                <label>How confident are you?</label>
                <select
                  value={confidence}
                  onChange={e => setConfidence(e.target.value)}
                >
                  <option value="known">Known - They told me directly</option>
                  <option value="likely">Likely - Strong evidence</option>
                  <option value="assumption">Assumption - Reasonable guess</option>
                  <option value="guess">Guess - Speculation</option>
                </select>
              </div>
            )}

            <div className="np-modal-actions">
              <button onClick={() => {
                setShowAddForm(false);
                setLinkingFrom(null);
              }}>
                Cancel
              </button>
              <button
                className="np-primary-btn"
                onClick={handleCreate}
                disabled={!content.trim()}
              >
                Add {addType === 'position' ? 'Position' : 'Interest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
