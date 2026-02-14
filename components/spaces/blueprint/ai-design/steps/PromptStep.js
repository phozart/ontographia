// components/spaces/blueprint/ai-design/steps/PromptStep.js
// Step 2: Display generated prompt with copy functionality + direct AI generation

import { useState, useEffect, useCallback } from 'react';
import { generateAIDesignPrompt, formatForClipboard } from '../../../../../lib/blueprint/ai-design-prompt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Available models for AI generation - organized by tier
const AI_MODELS = [
  // Free/Low-cost tier
  { key: 'gpt4o-mini', name: 'GPT-4o Mini', description: 'Free tier (best for testing)', cost: 'Free', tier: 'free', recommended: true },
  { key: 'haiku', name: 'Claude Haiku', description: 'Fast & cheap', cost: '~$0.01', tier: 'free' },
  // Standard tier
  { key: 'sonnet', name: 'Claude 3.5 Sonnet', description: 'Best balance (Recommended)', cost: '~$0.15', tier: 'standard', recommended: true },
  { key: 'gpt4o', name: 'GPT-4o', description: 'OpenAI balanced', cost: '~$0.10', tier: 'standard' },
  // Premium tier
  { key: 'opus', name: 'Claude 3 Opus', description: 'High quality', cost: '~$0.80', tier: 'premium' },
  { key: 'opus-4.5', name: 'Claude Opus 4.5', description: 'Latest & best', cost: '~$0.80', tier: 'premium' },
];

export default function PromptStep({ basicInfo, onValidate, onAIGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(null);
  const [selectedModel, setSelectedModel] = useState('sonnet');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Check if AI service is configured
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => setAiConfigured(data.configured))
      .catch(() => setAiConfigured(false));
  }, []);

  // Generate prompt when component mounts or basicInfo changes
  useEffect(() => {
    const generatedPrompt = generateAIDesignPrompt(basicInfo);
    setPrompt(generatedPrompt);
    onValidate(true); // This step is always valid
  }, [basicInfo, onValidate]);

  const handleCopy = useCallback(async () => {
    const textToCopy = formatForClipboard(prompt);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [prompt]);

  // Generate with AI directly
  const handleGenerateWithAI = useCallback(async () => {
    setGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(false);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          type: 'initiative-analysis',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      // Pass the generated content to parent
      setGenerationSuccess(true);
      if (onAIGenerated) {
        onAIGenerated(data.content, data.json);
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setGenerationError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [prompt, selectedModel, onAIGenerated]);

  const openClaude = () => {
    window.open('https://claude.ai/new', '_blank');
  };

  const openChatGPT = () => {
    window.open('https://chat.openai.com/', '_blank');
  };

  return (
    <div className="ai-wizard-step prompt-step">
      <div className="step-intro">
        <p>
          {aiConfigured
            ? 'Generate analysis directly with AI, or copy the prompt to use with your preferred AI assistant.'
            : 'Copy this prompt and paste it into Claude, ChatGPT, or another AI assistant.'}
        </p>
      </div>

      {/* AI Generation Section */}
      {aiConfigured && (
        <div className="ai-generate-section">
          <div className="ai-generate-header">
            <span className="ai-generate-badge">
              <AutoAwesomeIcon fontSize="small" />
              Direct AI Generation
            </span>
            <button
              className="model-select-btn"
              onClick={() => setShowModelSelect(!showModelSelect)}
              title="Select AI model"
            >
              <SettingsIcon fontSize="small" />
              {AI_MODELS.find(m => m.key === selectedModel)?.name}
            </button>
          </div>

          {showModelSelect && (
            <div className="model-select-dropdown">
              {/* Group by tier */}
              <div className="model-tier-group">
                <span className="model-tier-label">Free / Low-Cost</span>
                {AI_MODELS.filter(m => m.tier === 'free').map(model => (
                  <button
                    key={model.key}
                    className={`model-option ${selectedModel === model.key ? 'selected' : ''} ${model.recommended ? 'recommended' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.key);
                      setShowModelSelect(false);
                    }}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="model-description">{model.description}</span>
                    <span className="model-cost">{model.cost}</span>
                  </button>
                ))}
              </div>
              <div className="model-tier-group">
                <span className="model-tier-label">Standard</span>
                {AI_MODELS.filter(m => m.tier === 'standard').map(model => (
                  <button
                    key={model.key}
                    className={`model-option ${selectedModel === model.key ? 'selected' : ''} ${model.recommended ? 'recommended' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.key);
                      setShowModelSelect(false);
                    }}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="model-description">{model.description}</span>
                    <span className="model-cost">{model.cost}</span>
                  </button>
                ))}
              </div>
              <div className="model-tier-group">
                <span className="model-tier-label">Premium</span>
                {AI_MODELS.filter(m => m.tier === 'premium').map(model => (
                  <button
                    key={model.key}
                    className={`model-option ${selectedModel === model.key ? 'selected' : ''} ${model.recommended ? 'recommended' : ''}`}
                    onClick={() => {
                      setSelectedModel(model.key);
                      setShowModelSelect(false);
                    }}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="model-description">{model.description}</span>
                    <span className="model-cost">{model.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className={`btn btn-primary btn-lg ai-generate-btn ${generating ? 'generating' : ''} ${generationSuccess ? 'success' : ''}`}
            onClick={handleGenerateWithAI}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" />
                Generating analysis...
              </>
            ) : generationSuccess ? (
              <>
                <CheckIcon fontSize="small" />
                Generated! Click Next to review
              </>
            ) : (
              <>
                <AutoAwesomeIcon fontSize="small" />
                Generate with AI
              </>
            )}
          </button>

          {generationError && (
            <div className="generation-error">
              <ErrorOutlineIcon fontSize="small" />
              <span>{generationError}</span>
              <button onClick={() => setGenerationError(null)}>Dismiss</button>
            </div>
          )}

          <div className="ai-generate-divider">
            <span>or use manual method</span>
          </div>
        </div>
      )}

      {/* Manual copy/paste section */}
      <div className="prompt-actions-top">
        <button
          className={`copy-btn ${aiConfigured ? '' : 'large'} ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy prompt to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon fontSize="small" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ContentCopyIcon fontSize="small" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>

        <div className="ai-links">
          <button className="ai-link-btn" onClick={openClaude}>
            <OpenInNewIcon fontSize="small" />
            <span>Open Claude</span>
          </button>
          <button className="ai-link-btn" onClick={openChatGPT}>
            <OpenInNewIcon fontSize="small" />
            <span>Open ChatGPT</span>
          </button>
        </div>
      </div>

      <div className="prompt-preview">
        <div className="prompt-header">
          <span className="prompt-label">Generated Prompt</span>
          <span className="prompt-length">{prompt.length.toLocaleString()} characters</span>
        </div>
        <pre className="prompt-content">{prompt}</pre>
      </div>

      {!aiConfigured && (
        <>
          <div className="step-instructions">
            <h4>Next Steps:</h4>
            <ol>
              <li>Click <strong>Copy Prompt</strong> above</li>
              <li>Open Claude or ChatGPT using the links</li>
              <li>Paste the prompt and send it</li>
              <li>Wait for the AI to generate the JSON response</li>
              <li>Copy the <strong>entire JSON response</strong> (including the curly braces)</li>
              <li>Come back here and click <strong>Next</strong> to import</li>
            </ol>
          </div>

          <div className="step-tip">
            <strong>Tip:</strong> Claude and GPT-4 typically produce the best results.
            Make sure to copy the complete JSON response - it should start with <code>{'{'}</code> and end with <code>{'}'}</code>.
          </div>
        </>
      )}
    </div>
  );
}
