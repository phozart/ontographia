// components/portfolio/PortfolioLearn.js
// Educational content for Portfolio Studio

import { useState } from 'react';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Learn content sections
const LEARN_SECTIONS = {
  basics: {
    id: 'basics',
    title: 'Portfolio Basics',
    icon: SchoolIcon,
    color: '#8b5cf6',
    description: 'Understanding the foundations of portfolio management',
    topics: [
      {
        id: 'what-is-portfolio',
        title: 'What is Portfolio Management?',
        content: `
Portfolio management is the discipline of **deciding what to invest in** - and equally importantly, **what NOT to invest in**.

Unlike project management (which focuses on doing work right), portfolio management focuses on **doing the right work**.

**Key Questions Portfolio Answers:**
- Why are we considering this now?
- What outcome are we trying to move?
- What are we NOT doing because of this?
- When does this become a project?

**The Core Principle:**
A Portfolio Initiative is NOT a project yet. It represents a potential investment being evaluated. Only after explicit approval does it become a project.
        `,
      },
      {
        id: 'initiative-vs-project',
        title: 'Initiative vs Project',
        content: `
**Portfolio Initiative:**
- A potential investment being considered
- Subject to evaluation and prioritisation
- Can be deferred, dropped, or approved
- Exists in the "decide before commit" space

**Project:**
- An approved investment with allocated resources
- Has a defined scope, timeline, and budget
- Execution-focused
- Created when an initiative passes through the gate

**The Gate:**
The moment an initiative becomes a project is called a "gate" - it's a conscious decision to commit resources. This distinction prevents:
- Zombie initiatives that consume resources without approval
- Scope creep before proper evaluation
- Starting work before understanding value
        `,
      },
      {
        id: 'investment-themes',
        title: 'Investment Themes',
        content: `
**Investment Themes** are persistent strategic focus areas that group related initiatives.

**Why Themes Matter:**
- Prevent project sprawl by grouping related work
- Make strategic intent visible
- Enable portfolio-level trade-off discussions
- Connect daily work to strategy

**Theme Examples:**
- "Customer Experience Modernisation" (Grow)
- "Technical Debt Reduction" (Run)
- "AI/ML Capabilities" (Transform)
- "Regulatory Compliance" (Run)

**Theme Lifecycle:**
- Active: Currently accepting new initiatives
- Paused: Temporarily not prioritising new work
- Completed: Strategic objective achieved
- Retired: No longer relevant

**Best Practice:** Limit active themes to 3-5 per domain. Too many themes dilute focus.
        `,
      },
    ],
  },
  pipeline: {
    id: 'pipeline',
    title: 'The Initiative Pipeline',
    icon: TrendingUpIcon,
    color: '#3b82f6',
    description: 'Understanding the journey from idea to commitment',
    topics: [
      {
        id: 'pipeline-stages',
        title: 'Pipeline Stages',
        content: `
**The Four Stages:**

**1. Discover**
- Initial identification of opportunities
- Rough ideas and early hypotheses
- Low fidelity, high volume
- Question: "Is this worth exploring?"

**2. Evaluate**
- Deeper analysis of value and feasibility
- Stakeholder engagement
- Building the business case
- Question: "What would success look like?"

**3. Decide**
- Ready for investment decision
- Complete enough information
- Trade-offs understood
- Question: "Should we commit resources?"

**4. Commit**
- Approved and transitioning to project
- Resources allocated
- Ownership transferred to delivery
- Question: "How do we execute?"

**Key Principle:** Initiatives should move through stages OR be explicitly deferred/dropped. Nothing should sit indefinitely.
        `,
      },
      {
        id: 'stage-gates',
        title: 'Stage Gates & Decisions',
        content: `
**Gate Decisions:**

At each stage transition, a decision must be made:

**Advance:** Move to next stage
- Initiative meets criteria
- Information is sufficient
- Stakeholders aligned

**Defer:** Put on hold
- Good idea, wrong timing
- Dependencies not ready
- Resources not available
- Creates a Decision Record

**Drop:** Stop pursuing
- Value proposition doesn't hold
- Better alternatives exist
- Strategic fit lost
- Creates a Decision Record

**Decision Records:**
Every defer/drop creates institutional memory:
- What was decided?
- Why was it decided?
- Who made the decision?
- What changed?

This prevents re-litigating old decisions and captures learning.
        `,
      },
    ],
  },
  horizons: {
    id: 'horizons',
    title: 'Investment Horizons',
    icon: BalanceIcon,
    color: '#f59e0b',
    description: 'The McKinsey Three Horizons framework',
    topics: [
      {
        id: 'three-horizons',
        title: 'Run / Grow / Transform',
        content: `
**The McKinsey Three Horizons Model:**

**Horizon 1: Run (Maintain)**
- Keep the lights on
- Operational excellence
- Technical debt
- Compliance and security
- Timeline: Now

**Horizon 2: Grow (Extend)**
- Enhance existing capabilities
- Adjacent market expansion
- Feature development
- Timeline: Near-term (1-2 years)

**Horizon 3: Transform (Create)**
- New business models
- Disruptive innovation
- Future capabilities
- Timeline: Long-term (2-5 years)

**Why Balance Matters:**
A healthy portfolio maintains balance across horizons:
- Too much H1: Organisation stagnates
- Too little H1: Foundation crumbles
- No H3: Future competitiveness at risk
        `,
      },
      {
        id: 'horizon-allocation',
        title: 'Portfolio Balance',
        content: `
**Typical Healthy Allocation:**
- Run: 50-60%
- Grow: 30-40%
- Transform: 10-20%

**This varies by:**
- Industry maturity
- Competitive pressure
- Organisational strategy
- Risk appetite

**Warning Signs:**
- 100% Run: "Keeping the lights on" syndrome
- Heavy Transform with no Run: Building castles on sand
- No visible Transform: Future vulnerability

**Portfolio Health Check:**
Ask: "If we could only fund 70% of our current portfolio, what goes?"

This reveals true priorities and tests commitment to transform investments.
        `,
      },
    ],
  },
  prioritisation: {
    id: 'prioritisation',
    title: 'Prioritisation',
    icon: PlaylistAddCheckIcon,
    color: '#10b981',
    description: 'Making trade-offs visible and discussable',
    topics: [
      {
        id: 'wsjf',
        title: 'WSJF - Cost of Delay',
        content: `
**Weighted Shortest Job First (WSJF)**

WSJF helps prioritise by economic impact:

**WSJF = Cost of Delay / Job Size**

**Cost of Delay Components:**
1. User/Business Value: How valuable is this?
2. Time Criticality: How urgent is this?
3. Risk Reduction: What risk does this address?

**Job Size:**
Relative effort (T-shirt sizes work well)

**Why Cost of Delay Matters:**
Two initiatives with equal value but different time sensitivity should be prioritised differently.

**Example:**
- Feature A: $100K value, no deadline, Large effort
- Feature B: $80K value, compliance deadline in 3 months, Medium effort
- Feature B likely has higher WSJF due to time criticality
        `,
      },
      {
        id: 'confidence-levels',
        title: 'Confidence & Uncertainty',
        content: `
**Confidence Levels:**

**Hypothesis (10%)**
- Untested assumption
- No validation yet
- High uncertainty

**Explored (40%)**
- Some investigation done
- Initial stakeholder input
- Major unknowns remain

**Validated (70%)**
- Evidence supports approach
- Key assumptions tested
- Reasonable confidence

**Proven (90%)**
- Similar work done before
- Well-understood space
- Low uncertainty

**Using Confidence in Prioritisation:**
- Lower confidence = higher risk
- High-value + low-confidence = candidate for spike/experiment
- Don't compare apples and oranges (a proven small win vs hypothetical transformation)

**Confidence should increase as initiatives move through pipeline stages.**
        `,
      },
      {
        id: 'tradeoffs',
        title: 'Making Trade-offs',
        content: `
**The Art of Trade-offs:**

Portfolio management is fundamentally about saying "no" or "not yet" to good ideas.

**Trade-off Conversations:**
Instead of: "Should we do X?"
Ask: "What are we NOT doing if we do X?"

**Making Trade-offs Visible:**
1. Compare within horizons (Run vs Run)
2. Compare across horizons (more Run vs Transform)
3. Consider dependencies (what unblocks what?)
4. Factor in team capacity

**Common Anti-patterns:**
- Prioritising everything (nothing is prioritised)
- Avoiding hard decisions
- Death by committee
- Analysis paralysis

**Best Practice:**
Create a "parking lot" for good ideas that aren't the current focus. Review quarterly. This respects the idea while maintaining focus.
        `,
      },
    ],
  },
  practices: {
    id: 'practices',
    title: 'Best Practices',
    icon: LightbulbIcon,
    color: '#06b6d4',
    description: 'Patterns for effective portfolio management',
    topics: [
      {
        id: 'cadence',
        title: 'Portfolio Cadence',
        content: `
**Establish a Regular Rhythm:**

**Weekly:**
- Quick status on in-flight initiatives
- Blockers and dependencies
- No major decisions (save for forums)

**Monthly:**
- Portfolio review
- Stage gate decisions
- New initiative intake
- Metrics review

**Quarterly:**
- Strategic alignment check
- Theme review
- Horizon balance assessment
- Parking lot review

**Annually:**
- Strategy refresh
- Theme retirement/creation
- Major portfolio rebalancing

**Key Principle:**
Decisions should happen at the right level with the right information. Weekly meetings shouldn't make quarterly decisions.
        `,
      },
      {
        id: 'common-pitfalls',
        title: 'Common Pitfalls',
        content: `
**Avoid These Anti-patterns:**

**1. The Project Factory**
Everything becomes a project immediately. No evaluation, no prioritisation.
*Fix: Enforce the initiative → project gate*

**2. The Zombie Portfolio**
Initiatives never die, just linger. No one will kill anything.
*Fix: Time-box stages. If no decision in X weeks, force one.*

**3. The HiPPO Effect**
Highest Paid Person's Opinion drives everything. No objective criteria.
*Fix: Transparent prioritisation criteria. Make trade-offs visible.*

**4. The Shiny Object**
New ideas always win. Existing commitments suffer.
*Fix: Protect committed capacity. New intake is limited.*

**5. The False Start**
Projects start before initiatives are fully evaluated.
*Fix: Clear definition of "ready for project"*
        `,
      },
      {
        id: 'success-factors',
        title: 'Success Factors',
        content: `
**What Makes Portfolio Management Work:**

**1. Executive Sponsorship**
Someone senior must enforce portfolio discipline. Otherwise, everything is an exception.

**2. Visible Trade-offs**
When adding something, show what gets displaced. Make the cost of "yes" visible.

**3. Decision Authority**
Clear ownership of portfolio decisions. Who can approve? Who can defer? Who can drop?

**4. Information Quality**
Decisions are only as good as the information. Invest in initiative discovery.

**5. Respect the Gate**
The initiative → project transition must mean something. Resources don't flow until approved.

**6. Learning Loops**
Track outcomes. Did approved initiatives deliver value? Were deferrals revisited?

**The Ultimate Test:**
Can you explain, for any initiative, why it was prioritised over alternatives?
        `,
      },
    ],
  },
};

// Expandable topic component
function LearnTopic({ topic, isExpanded, onToggle }) {
  return (
    <div className="learn-topic">
      <button className="topic-header" onClick={onToggle}>
        {isExpanded ? (
          <ExpandMoreIcon fontSize="small" />
        ) : (
          <ChevronRightIcon fontSize="small" />
        )}
        <span>{topic.title}</span>
      </button>
      {isExpanded && (
        <div className="topic-content">
          {topic.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <h4 key={i}>{line.replace(/\*\*/g, '')}</h4>;
            }
            if (line.startsWith('**')) {
              const boldEnd = line.indexOf('**', 2);
              if (boldEnd > 2) {
                return (
                  <p key={i}>
                    <strong>{line.slice(2, boldEnd)}</strong>
                    {line.slice(boldEnd + 2)}
                  </p>
                );
              }
            }
            if (line.startsWith('- ')) {
              return <li key={i}>{line.slice(2)}</li>;
            }
            if (line.startsWith('*') && line.endsWith('*')) {
              return <p key={i} className="italic">{line.replace(/\*/g, '')}</p>;
            }
            if (line.trim()) {
              return <p key={i}>{line}</p>;
            }
            return null;
          })}
        </div>
      )}

      <style jsx>{`
        .learn-topic {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .topic-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg-primary);
          border: none;
          cursor: pointer;
          font-size: 0.9375rem;
          font-weight: 500;
          text-align: left;
          color: var(--text);
        }

        .topic-header:hover {
          background: var(--bg-secondary);
        }

        .topic-content {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          font-size: 0.875rem;
          line-height: 1.7;
        }

        .topic-content h4 {
          margin: 16px 0 8px;
          font-size: 0.9375rem;
          color: var(--text);
        }

        .topic-content h4:first-child {
          margin-top: 0;
        }

        .topic-content p {
          margin: 8px 0;
          color: var(--text-muted);
        }

        .topic-content li {
          margin-left: 20px;
          margin-bottom: 4px;
          color: var(--text-muted);
        }

        .topic-content .italic {
          font-style: italic;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

// Main Learn component
export default function PortfolioLearn({ activeHelpId = 'basics' }) {
  const [expandedTopics, setExpandedTopics] = useState({});

  const section = LEARN_SECTIONS[activeHelpId] || LEARN_SECTIONS.basics;
  const SectionIcon = section.icon;

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  return (
    <div className="learn-container">
      <div className="learn-header">
        <SectionIcon style={{ color: section.color, fontSize: 32 }} />
        <div>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
      </div>

      <div className="learn-topics">
        {section.topics.map(topic => (
          <LearnTopic
            key={topic.id}
            topic={topic}
            isExpanded={expandedTopics[topic.id]}
            onToggle={() => toggleTopic(topic.id)}
          />
        ))}
      </div>

      <div className="learn-nav">
        <h3>More Topics</h3>
        <div className="nav-links">
          {Object.values(LEARN_SECTIONS).map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                className={`nav-link ${s.id === activeHelpId ? 'active' : ''}`}
                disabled={s.id === activeHelpId}
              >
                <Icon style={{ color: s.color }} fontSize="small" />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .learn-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .learn-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 32px;
        }

        .learn-header h1 {
          margin: 0 0 4px;
          font-size: 1.5rem;
        }

        .learn-header p {
          margin: 0;
          color: var(--text-muted);
        }

        .learn-topics {
          margin-bottom: 32px;
        }

        .learn-nav {
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .learn-nav h3 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-link:hover:not(:disabled) {
          background: var(--bg-secondary);
        }

        .nav-link.active {
          background: var(--bg-secondary);
          border-color: var(--accent);
        }

        .nav-link:disabled {
          cursor: default;
        }
      `}</style>
    </div>
  );
}

export { LEARN_SECTIONS };
