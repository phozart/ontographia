// components/spaces/blueprint/ai-design/steps/PreviewStep.js
// Step 5: Preview all data sections before import

import { useState, useEffect } from 'react';
import { detectAvailableSections, IMPORT_SECTIONS } from '../../../../../lib/blueprint/ai-import-schema';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PublicIcon from '@mui/icons-material/Public';

const SECTION_ICONS = {
  idea: LightbulbIcon,
  market: TrendingUpIcon,
  pestle: PublicIcon,
  assess: AssessmentIcon,
  canvases: DashboardIcon,
  rice: CalculateIcon,
  case: DescriptionIcon,
  variants: CompareArrowsIcon,
  nextSteps: ListAltIcon,
};

export default function PreviewStep({ parsedData, onValidate }) {
  const [expandedSections, setExpandedSections] = useState(['idea']);
  const [availableSections, setAvailableSections] = useState({});

  useEffect(() => {
    if (parsedData) {
      const available = detectAvailableSections(parsedData);
      setAvailableSections(available);
      // Expand first available section
      const firstAvailable = Object.entries(available).find(([, v]) => v)?.[0];
      if (firstAvailable) {
        setExpandedSections([firstAvailable]);
      }
    }
    onValidate(true); // Preview step is always valid
  }, [parsedData, onValidate]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderSectionContent = (sectionId) => {
    if (!parsedData) return null;

    switch (sectionId) {
      case 'idea':
        return renderIdeaSection();
      case 'market':
        return renderMarketSection();
      case 'pestle':
        return renderPESTLESection();
      case 'assess':
        return renderAssessSection();
      case 'canvases':
        return renderCanvasesSection();
      case 'rice':
        return renderRICESection();
      case 'case':
        return renderCaseSection();
      case 'variants':
        return renderVariantsSection();
      case 'nextSteps':
        return renderNextStepsSection();
      default:
        return null;
    }
  };

  const renderIdeaSection = () => {
    const idea = parsedData.idea;
    if (!idea) return null;
    return (
      <div className="preview-content">
        {idea.refined_description && (
          <div className="preview-field">
            <label>Description</label>
            <p>{idea.refined_description}</p>
          </div>
        )}
        {idea.problem_statement && (
          <div className="preview-field">
            <label>Problem Statement</label>
            <p>{idea.problem_statement}</p>
          </div>
        )}
        {idea.hypothesis && (
          <div className="preview-field">
            <label>Hypothesis</label>
            <p className="hypothesis-text">{idea.hypothesis}</p>
          </div>
        )}
        {idea.target_customer && (
          <div className="preview-field">
            <label>Target Customer</label>
            <p>{idea.target_customer}</p>
          </div>
        )}
        {idea.success_metrics?.length > 0 && (
          <div className="preview-field">
            <label>Success Metrics</label>
            <ul className="preview-list">
              {idea.success_metrics.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}
        {idea.key_assumptions?.length > 0 && (
          <div className="preview-field">
            <label>Key Assumptions</label>
            <ul className="preview-list">
              {idea.key_assumptions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderMarketSection = () => {
    const explore = parsedData.explore;
    if (!explore) return null;
    return (
      <div className="preview-content">
        {explore.market_sizing && (
          <div className="preview-subsection">
            <h5>Market Sizing</h5>
            <div className="market-metrics">
              <div className="metric">
                <span className="metric-label">TAM</span>
                <span className="metric-value">{formatCurrency(explore.market_sizing.tam)}</span>
                {explore.market_sizing.tam_assumptions && (
                  <span className="metric-note">{explore.market_sizing.tam_assumptions}</span>
                )}
              </div>
              <div className="metric">
                <span className="metric-label">SAM</span>
                <span className="metric-value">{formatCurrency(explore.market_sizing.sam)}</span>
                {explore.market_sizing.sam_assumptions && (
                  <span className="metric-note">{explore.market_sizing.sam_assumptions}</span>
                )}
              </div>
              <div className="metric">
                <span className="metric-label">SOM</span>
                <span className="metric-value">{formatCurrency(explore.market_sizing.som)}</span>
                {explore.market_sizing.som_assumptions && (
                  <span className="metric-note">{explore.market_sizing.som_assumptions}</span>
                )}
              </div>
            </div>
          </div>
        )}
        {explore.competitors?.length > 0 && (
          <div className="preview-subsection">
            <h5>Competitors ({explore.competitors.length})</h5>
            <div className="competitors-list">
              {explore.competitors.map((c, i) => (
                <div key={i} className="competitor-item">
                  <span className="competitor-name">{c.name}</span>
                  <span className={`threat-badge ${c.threat_level}`}>{c.threat_level}</span>
                  {c.positioning && <p className="competitor-positioning">{c.positioning}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {explore.customer_segments?.length > 0 && (
          <div className="preview-subsection">
            <h5>Customer Segments ({explore.customer_segments.length})</h5>
            <div className="segments-list">
              {explore.customer_segments.map((s, i) => (
                <div key={i} className="segment-item">
                  <span className="segment-name">{s.name}</span>
                  <span className={`pain-badge ${s.pain_intensity}`}>{s.pain_intensity} pain</span>
                  {s.description && <p className="segment-desc">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPESTLESection = () => {
    const pestle = parsedData.explore?.pestle;
    if (!pestle) return null;
    const categories = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];
    return (
      <div className="preview-content pestle-preview">
        <div className="pestle-grid">
          {categories.map(cat => (
            <div key={cat} className="pestle-category">
              <h5>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>
              {pestle[cat]?.length > 0 ? (
                <ul>
                  {pestle[cat].map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              ) : (
                <p className="no-data">No factors</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssessSection = () => {
    const assess = parsedData.assess;
    if (!assess) return null;
    return (
      <div className="preview-content">
        {assess.scoring && (
          <div className="preview-subsection">
            <h5>Scoring</h5>
            <div className="scores-grid">
              {Object.entries(assess.scoring).map(([key, value]) => (
                <div key={key} className="score-item">
                  <span className="score-label">{key.replace(/_/g, ' ')}</span>
                  <span className="score-value">{value.score}/5</span>
                  {value.rationale && <span className="score-rationale">{value.rationale}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {assess.horizon_recommendation && (
          <div className="preview-field">
            <label>Horizon Recommendation</label>
            <span className={`horizon-badge ${assess.horizon_recommendation}`}>
              {assess.horizon_recommendation.toUpperCase()}
            </span>
            {assess.horizon_rationale && <p>{assess.horizon_rationale}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderCanvasesSection = () => {
    const canvases = parsedData.canvases;
    if (!canvases) return null;
    return (
      <div className="preview-content canvases-preview">
        {canvases.valueProp && (
          <div className="canvas-preview">
            <h5>Value Proposition Canvas</h5>
            <div className="canvas-summary">
              <span>{canvases.valueProp.customerJobs?.length || 0} jobs</span>
              <span>{canvases.valueProp.customerPains?.length || 0} pains</span>
              <span>{canvases.valueProp.customerGains?.length || 0} gains</span>
            </div>
          </div>
        )}
        {canvases.lean && (
          <div className="canvas-preview">
            <h5>Lean Canvas</h5>
            <div className="lean-summary">
              {canvases.lean.uniqueValue && (
                <p className="unique-value">"{canvases.lean.uniqueValue}"</p>
              )}
            </div>
          </div>
        )}
        {canvases.swot && (
          <div className="canvas-preview">
            <h5>SWOT Canvas</h5>
            <div className="canvas-summary">
              <span>{canvases.swot.strengths?.length || 0} strengths</span>
              <span>{canvases.swot.weaknesses?.length || 0} weaknesses</span>
              <span>{canvases.swot.opportunities?.length || 0} opportunities</span>
              <span>{canvases.swot.threats?.length || 0} threats</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRICESection = () => {
    const rice = parsedData.riceScores;
    if (!rice) return null;
    const score = rice.effort > 0
      ? Math.round((rice.reach * rice.impact * (rice.confidence / 100)) / rice.effort)
      : 0;
    return (
      <div className="preview-content rice-preview">
        <div className="rice-score-large">{score.toLocaleString()}</div>
        <div className="rice-breakdown">
          <div className="rice-factor">
            <span className="factor-label">Reach</span>
            <span className="factor-value">{rice.reach?.toLocaleString()}</span>
          </div>
          <div className="rice-factor">
            <span className="factor-label">Impact</span>
            <span className="factor-value">{rice.impact}/3</span>
          </div>
          <div className="rice-factor">
            <span className="factor-label">Confidence</span>
            <span className="factor-value">{rice.confidence}%</span>
          </div>
          <div className="rice-factor">
            <span className="factor-label">Effort</span>
            <span className="factor-value">{rice.effort} person-months</span>
          </div>
        </div>
        {rice.rationale && <p className="rice-rationale">{rice.rationale}</p>}
      </div>
    );
  };

  const renderCaseSection = () => {
    const businessCase = parsedData.case;
    if (!businessCase) return null;
    return (
      <div className="preview-content case-preview">
        {businessCase.executive_summary && (
          <div className="preview-field">
            <label>Executive Summary</label>
            <p className="exec-summary">{businessCase.executive_summary}</p>
          </div>
        )}
        {businessCase.options?.length > 0 && (
          <div className="preview-subsection">
            <h5>Options ({businessCase.options.length})</h5>
            {businessCase.options.map((opt, i) => (
              <div key={i} className={`option-item ${businessCase.recommended_option === opt.id ? 'recommended' : ''}`}>
                <span className="option-name">{opt.name}</span>
                {businessCase.recommended_option === opt.id && (
                  <span className="recommended-badge">Recommended</span>
                )}
                <span className="option-cost">{formatCurrency(opt.estimated_cost)}</span>
              </div>
            ))}
          </div>
        )}
        {businessCase.financials && (
          <div className="preview-subsection">
            <h5>Financials</h5>
            <div className="financials-grid">
              <div className="financial-item">
                <span className="fin-label">Investment</span>
                <span className="fin-value">{formatCurrency(businessCase.financials.investment_required)}</span>
              </div>
              <div className="financial-item">
                <span className="fin-label">Annual Revenue</span>
                <span className="fin-value">{formatCurrency(businessCase.financials.annual_revenue_potential)}</span>
              </div>
              <div className="financial-item">
                <span className="fin-label">Breakeven</span>
                <span className="fin-value">{businessCase.financials.breakeven_months} months</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVariantsSection = () => {
    const variants = parsedData.variants;
    if (!variants?.length) return null;
    return (
      <div className="preview-content variants-preview">
        {variants.map((v, i) => (
          <div key={i} className="variant-item">
            <h5>{v.name}</h5>
            <p>{v.description}</p>
            {v.estimated_investment && (
              <span className="variant-investment">{formatCurrency(v.estimated_investment)}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderNextStepsSection = () => {
    const questions = parsedData.questions_to_validate;

    // Collect all questions from the new object structure
    const allQuestions = [];
    if (questions) {
      if (typeof questions === 'object' && !Array.isArray(questions)) {
        // New schema: object with named fields
        if (questions.field_observation_required) {
          allQuestions.push({ label: 'Field Observation', text: questions.field_observation_required });
        }
        if (questions.risky_economic_assumption) {
          allQuestions.push({ label: 'Economic Assumption', text: questions.risky_economic_assumption });
        }
        if (questions.initiative_killer) {
          allQuestions.push({ label: 'Initiative Killer', text: questions.initiative_killer });
        }
        if (questions.moat_validation) {
          allQuestions.push({ label: 'Moat Validation', text: questions.moat_validation });
        }
        if (questions.additional_questions?.length > 0) {
          questions.additional_questions.forEach(q => {
            allQuestions.push({ label: 'Additional', text: q });
          });
        }
      } else if (Array.isArray(questions)) {
        // Legacy schema: simple array of strings
        questions.forEach(q => {
          allQuestions.push({ label: null, text: q });
        });
      }
    }

    return (
      <div className="preview-content next-steps-preview">
        {parsedData.next_steps?.length > 0 && (
          <div className="preview-subsection">
            <h5>Recommended Next Steps</h5>
            <ol className="next-steps-list">
              {parsedData.next_steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}
        {allQuestions.length > 0 && (
          <div className="preview-subsection">
            <h5>Questions to Validate</h5>
            <ul className="questions-list">
              {allQuestions.map((q, i) => (
                <li key={i}>
                  {q.label && <span className="question-label">{q.label}:</span>}
                  {q.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!parsedData) {
    return (
      <div className="ai-wizard-step preview-step">
        <div className="step-intro">
          <p>No data to preview. Please go back and import JSON first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-wizard-step preview-step">
      <div className="step-intro">
        <p>
          Review the AI-generated data below. Click on each section to expand and see the details.
          In the next step, you'll select which sections to import.
        </p>
      </div>

      <div className="preview-sections">
        {Object.entries(IMPORT_SECTIONS).map(([sectionId, sectionInfo]) => {
          const isAvailable = availableSections[sectionId];
          const isExpanded = expandedSections.includes(sectionId);
          const Icon = SECTION_ICONS[sectionId] || ListAltIcon;

          return (
            <div
              key={sectionId}
              className={`preview-section ${isAvailable ? 'available' : 'unavailable'} ${isExpanded ? 'expanded' : ''}`}
            >
              <button
                className="section-header"
                onClick={() => isAvailable && toggleSection(sectionId)}
                disabled={!isAvailable}
              >
                <Icon className="section-icon" fontSize="small" />
                <span className="section-name">{sectionInfo.name}</span>
                {!isAvailable && <span className="no-data-badge">No data</span>}
                {isAvailable && (isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </button>
              {isAvailable && isExpanded && (
                <div className="section-content">
                  {renderSectionContent(sectionId)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="step-tip">
        <strong>Tip:</strong> Take time to review the market sizing and competitive analysis.
        AI estimates are based on general knowledge and should be validated with real data.
      </div>
    </div>
  );
}
