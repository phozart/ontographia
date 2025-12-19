/**
 * Risk Guidance Panel Component
 *
 * Provides contextual help and guidance for risk management.
 */

import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { RISK_GUIDANCE, RISK_TYPE_DEFS } from '../../lib/risk-types';

export default function RiskGuidancePanel({ type, view }) {
  const typeDef = RISK_TYPE_DEFS[type];
  const guidance = RISK_GUIDANCE[type];

  // View-specific guidance
  const viewGuidance = {
    dashboard: {
      title: 'Understanding Your Risk Dashboard',
      tips: [
        'The heat map shows your risk distribution by likelihood and impact',
        'Focus on critical and high risks first - they need immediate attention',
        'Monitor control effectiveness to ensure risks are properly mitigated',
        'Aim for resilience measures at "Managed" maturity or higher',
      ],
    },
    heatmap: {
      title: 'Risk Heat Map',
      tips: [
        'Higher likelihood and impact puts risks in the red zone',
        'Click on cells to see which risks fall into each category',
        'Target: move risks toward the green (lower-left) quadrant',
        'Use controls to reduce likelihood or impact',
      ],
    },
    register: {
      title: 'Risk Register',
      tips: [
        'Document all identified risks in a central register',
        'Assign clear ownership for each risk',
        'Track the stage of each risk through its lifecycle',
        'Review and update risk assessments regularly',
      ],
    },
  };

  const currentViewGuidance = viewGuidance[view] || viewGuidance.dashboard;

  return (
    <div className="guidance-panel">
      {/* Module Guidance */}
      {type && guidance && (
        <div className="guidance-section">
          <div className="section-header">
            <div className="header-icon" style={{ background: `${typeDef?.color}20`, color: typeDef?.color }}>
              <LightbulbIcon fontSize="small" />
            </div>
            <h4>About {typeDef?.label}s</h4>
          </div>

          <div className="guidance-content">
            <p>{guidance.what}</p>

            {guidance.prompts && (
              <div className="prompts">
                <h5>Questions to Ask</h5>
                {guidance.prompts.map((prompt, idx) => (
                  <div key={idx} className="prompt">{prompt}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Guidance */}
      <div className="guidance-section">
        <div className="section-header">
          <div className="header-icon">
            <HelpOutlineIcon fontSize="small" />
          </div>
          <h4>{currentViewGuidance.title}</h4>
        </div>

        <div className="tips-list">
          {currentViewGuidance.tips.map((tip, idx) => (
            <div key={idx} className="tip-item">
              <span className="tip-bullet">{idx + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="guidance-section">
        <div className="section-header">
          <div className="header-icon">
            <MenuBookIcon fontSize="small" />
          </div>
          <h4>Best Practices</h4>
        </div>

        <div className="best-practices">
          <div className="practice">
            <strong>Be Specific</strong>
            <p>Avoid vague risk descriptions. Clearly state what could happen and the impact.</p>
          </div>
          <div className="practice">
            <strong>Assign Owners</strong>
            <p>Every risk should have a clear owner accountable for monitoring and mitigation.</p>
          </div>
          <div className="practice">
            <strong>Review Regularly</strong>
            <p>Risk landscapes change. Schedule regular reviews of your risk register.</p>
          </div>
          <div className="practice">
            <strong>Link to Controls</strong>
            <p>Connect risks to specific controls to show how they are being mitigated.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .guidance-panel {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .guidance-section {
          background: var(--bg);
          border-radius: 10px;
          padding: 16px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          color: var(--accent);
          border-radius: 8px;
        }

        .section-header h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text);
        }

        .guidance-content p {
          margin: 0 0 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .prompts {
          background: var(--panel);
          border-radius: 8px;
          padding: 12px;
        }

        .prompts h5 {
          margin: 0 0 8px;
          font-size: 0.8rem;
          color: var(--text);
        }

        .prompt {
          padding: 6px 10px;
          margin-bottom: 6px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .prompt:last-child {
          margin-bottom: 0;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .tip-bullet {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--border);
          color: var(--text-muted);
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .best-practices {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .practice {
          padding: 10px;
          background: var(--panel);
          border-radius: 8px;
        }

        .practice strong {
          display: block;
          font-size: 0.85rem;
          color: var(--text);
          margin-bottom: 4px;
        }

        .practice p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
