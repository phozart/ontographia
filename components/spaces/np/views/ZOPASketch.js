// components/np/views/ZOPASketch.js
// Sketch the Zone of Possible Agreement

import { useState, useCallback, useMemo } from 'react';
import { useNP } from '../NPContext';

export default function ZOPASketch() {
  const {
    currentSituation,
    elements,
    createElement,
    updateElement,
    deleteElement
  } = useNP();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'batna',
    party: 'mine',
    content: '',
    confidence: 'assumption'
  });

  // Get BATNA and ZOPA elements
  const batnas = useMemo(() =>
    elements.filter(e => e.element_type === 'batna'),
    [elements]
  );

  const zopaHypotheses = useMemo(() =>
    elements.filter(e => e.element_type === 'zopa_hypothesis'),
    [elements]
  );

  const redLines = useMemo(() =>
    elements.filter(e => e.element_type === 'red_line'),
    [elements]
  );

  const concessions = useMemo(() =>
    elements.filter(e => e.element_type === 'concession'),
    [elements]
  );

  const myBatna = batnas.find(b => b.party === 'mine');
  const theirBatna = batnas.find(b => b.party === 'theirs');
  const myRedLines = redLines.filter(r => r.party === 'mine');
  const theirRedLines = redLines.filter(r => r.party === 'theirs');

  const handleCreate = useCallback(async () => {
    if (!formData.content.trim()) return;

    await createElement({
      element_type: formData.type,
      category: formData.type === 'batna' || formData.type === 'zopa_hypothesis' ? 'assessment' : 'preparation',
      party: formData.party,
      content: formData.content.trim(),
      confidence: formData.party === 'mine' ? 'known' : formData.confidence
    });

    setFormData({
      type: 'batna',
      party: 'mine',
      content: '',
      confidence: 'assumption'
    });
    setShowAddForm(false);
  }, [createElement, formData]);

  const openAddForm = (type, party) => {
    setFormData({
      type,
      party,
      content: '',
      confidence: party === 'mine' ? 'known' : 'assumption'
    });
    setShowAddForm(true);
  };

  if (!currentSituation) return null;

  return (
    <div className="np-zopa-sketch">
      <div className="np-sketch-header">
        <h2>ZOPA & BATNA Analysis</h2>
        <p>
          <strong>BATNA</strong> = Best Alternative To Negotiated Agreement (your Plan B).
          <strong> ZOPA</strong> = Zone of Possible Agreement (where a deal could happen).
        </p>
      </div>

      {/* BATNA Section */}
      <div className="np-batna-section">
        <h3>Best Alternatives (BATNAs)</h3>
        <p className="np-section-hint">
          What happens if you walk away? The stronger your BATNA, the more leverage you have.
        </p>

        <div className="np-batna-grid">
          {/* My BATNA */}
          <div className="np-batna-card np-party-mine">
            <h4>My BATNA</h4>
            {myBatna ? (
              <div className="np-batna-content">
                <p>{myBatna.content}</p>
                <button
                  className="np-delete-btn"
                  onClick={() => deleteElement(myBatna.id)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="np-empty-batna">
                <p>What's your Plan B if this doesn't work out?</p>
                <button onClick={() => openAddForm('batna', 'mine')}>
                  Define my BATNA
                </button>
              </div>
            )}

            <div className="np-batna-strength">
              <label>BATNA Strength:</label>
              <div className="np-strength-scale">
                <span className="np-weak">Weak</span>
                <div className="np-scale-track">
                  <div className="np-scale-marker" style={{ left: '50%' }} />
                </div>
                <span className="np-strong">Strong</span>
              </div>
            </div>
          </div>

          {/* Their BATNA */}
          <div className="np-batna-card np-party-theirs">
            <h4>Their BATNA (Estimated)</h4>
            {theirBatna ? (
              <div className="np-batna-content">
                <p>{theirBatna.content}</p>
                <span className={`np-confidence-tag np-conf-${theirBatna.confidence}`}>
                  {theirBatna.confidence}
                </span>
                <button
                  className="np-delete-btn"
                  onClick={() => deleteElement(theirBatna.id)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="np-empty-batna">
                <p>What's their alternative if they walk away?</p>
                <button onClick={() => openAddForm('batna', 'theirs')}>
                  Estimate their BATNA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BATNA Insight */}
        {myBatna && theirBatna && (
          <div className="np-batna-insight">
            <h5>Power Analysis</h5>
            <p>
              Compare your alternatives. Who has more to lose if no deal is reached?
              This affects who has leverage.
            </p>
          </div>
        )}
      </div>

      {/* Red Lines Section */}
      <div className="np-redlines-section">
        <h3>Red Lines / Walk-Away Points</h3>
        <p className="np-section-hint">
          What absolutely cannot be compromised? Know these before you negotiate.
        </p>

        <div className="np-redlines-grid">
          {/* My Red Lines */}
          <div className="np-redlines-column np-party-mine">
            <h4>My Red Lines</h4>
            {myRedLines.length > 0 ? (
              <ul className="np-redlines-list">
                {myRedLines.map(rl => (
                  <li key={rl.id} className="np-redline-item">
                    <span className="np-redline-marker">🚫</span>
                    {rl.content}
                    <button
                      className="np-delete-btn-sm"
                      onClick={() => deleteElement(rl.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="np-empty-hint">No red lines defined</p>
            )}
            <button
              className="np-add-redline"
              onClick={() => openAddForm('red_line', 'mine')}
            >
              + Add Red Line
            </button>
          </div>

          {/* Their Red Lines (Estimated) */}
          <div className="np-redlines-column np-party-theirs">
            <h4>Their Red Lines (Estimated)</h4>
            {theirRedLines.length > 0 ? (
              <ul className="np-redlines-list">
                {theirRedLines.map(rl => (
                  <li key={rl.id} className="np-redline-item">
                    <span className="np-redline-marker">🚫</span>
                    {rl.content}
                    <span className={`np-conf-badge np-conf-${rl.confidence}`}>
                      {rl.confidence}
                    </span>
                    <button
                      className="np-delete-btn-sm"
                      onClick={() => deleteElement(rl.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="np-empty-hint">No estimated red lines</p>
            )}
            <button
              className="np-add-redline"
              onClick={() => openAddForm('red_line', 'theirs')}
            >
              + Add Estimated Red Line
            </button>
          </div>
        </div>
      </div>

      {/* ZOPA Visualization */}
      <div className="np-zopa-section">
        <h3>Zone of Possible Agreement (ZOPA)</h3>
        <p className="np-section-hint">
          Where your acceptable range overlaps with theirs - this is where deals happen.
        </p>

        <div className="np-zopa-diagram">
          <div className="np-zopa-track">
            <div className="np-my-range" title="My acceptable range">
              <span className="np-range-label">My Range</span>
            </div>
            <div className="np-their-range" title="Their acceptable range (estimated)">
              <span className="np-range-label">Their Range</span>
            </div>
            <div className="np-zopa-overlap" title="Possible agreement zone">
              <span className="np-zopa-label">ZOPA</span>
            </div>
          </div>
          <div className="np-zopa-axis">
            <span>Favor Them</span>
            <span>Favor Me</span>
          </div>
        </div>

        {/* ZOPA Hypotheses */}
        <div className="np-zopa-hypotheses">
          <h4>ZOPA Hypotheses</h4>
          {zopaHypotheses.length > 0 ? (
            <div className="np-hypotheses-list">
              {zopaHypotheses.map(z => (
                <div key={z.id} className="np-hypothesis-card">
                  <p>{z.content}</p>
                  <span className={`np-conf-badge np-conf-${z.confidence}`}>
                    {z.confidence}
                  </span>
                  <button
                    className="np-delete-btn-sm"
                    onClick={() => deleteElement(z.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="np-empty-hint">
              Based on your analysis, where might agreement be possible?
            </p>
          )}
          <button
            className="np-add-hypothesis"
            onClick={() => openAddForm('zopa_hypothesis', 'shared')}
          >
            + Add ZOPA Hypothesis
          </button>
        </div>
      </div>

      {/* Possible Concessions */}
      <div className="np-concessions-section">
        <h3>Possible Concessions & Trades</h3>
        <p className="np-section-hint">
          What could you give up that costs you little but means a lot to them? (and vice versa)
        </p>

        <div className="np-concessions-grid">
          <div className="np-concession-column">
            <h4>I Could Offer...</h4>
            {concessions.filter(c => c.party === 'mine').map(c => (
              <div key={c.id} className="np-concession-item">
                {c.content}
                <button
                  className="np-delete-btn-sm"
                  onClick={() => deleteElement(c.id)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="np-add-concession"
              onClick={() => openAddForm('concession', 'mine')}
            >
              + Add what I could offer
            </button>
          </div>

          <div className="np-concession-column">
            <h4>They Could Offer...</h4>
            {concessions.filter(c => c.party === 'theirs').map(c => (
              <div key={c.id} className="np-concession-item">
                {c.content}
                <span className={`np-conf-badge np-conf-${c.confidence}`}>
                  {c.confidence}
                </span>
                <button
                  className="np-delete-btn-sm"
                  onClick={() => deleteElement(c.id)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="np-add-concession"
              onClick={() => openAddForm('concession', 'theirs')}
            >
              + Add what they might offer
            </button>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="np-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>
            <h2>
              Add {formData.party === 'mine' ? 'My' : formData.party === 'theirs' ? 'Their' : ''} {
                formData.type === 'batna' ? 'BATNA' :
                formData.type === 'red_line' ? 'Red Line' :
                formData.type === 'zopa_hypothesis' ? 'ZOPA Hypothesis' :
                'Concession'
              }
            </h2>

            <div className="np-form-group">
              <label>
                {formData.type === 'batna' ? 'What happens if no deal is reached?' :
                 formData.type === 'red_line' ? 'What cannot be compromised?' :
                 formData.type === 'zopa_hypothesis' ? 'Where might agreement be possible?' :
                 'What could be offered as a trade?'}
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                autoFocus
              />
            </div>

            {formData.party === 'theirs' && (
              <div className="np-form-group">
                <label>Confidence</label>
                <select
                  value={formData.confidence}
                  onChange={e => setFormData(prev => ({ ...prev, confidence: e.target.value }))}
                >
                  <option value="known">Known</option>
                  <option value="likely">Likely</option>
                  <option value="assumption">Assumption</option>
                  <option value="guess">Guess</option>
                </select>
              </div>
            )}

            <div className="np-modal-actions">
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
              <button
                className="np-primary-btn"
                onClick={handleCreate}
                disabled={!formData.content.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
