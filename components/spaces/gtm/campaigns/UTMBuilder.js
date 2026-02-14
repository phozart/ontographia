// components/spaces/gtm/campaigns/UTMBuilder.js
// UTM link builder and validator for campaigns

import { useState, useMemo, useCallback } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const SOURCES = [
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'email', label: 'Email' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'partner', label: 'Partner' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'direct', label: 'Direct' }
];

const MEDIUMS = [
  { value: 'cpc', label: 'CPC (Paid Search)' },
  { value: 'cpm', label: 'CPM (Display)' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social (Organic)' },
  { value: 'social-paid', label: 'Social (Paid)' },
  { value: 'referral', label: 'Referral' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'organic', label: 'Organic' },
  { value: 'display', label: 'Display' },
  { value: 'video', label: 'Video' }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export default function UTMBuilder({
  campaignName = '',
  savedLinks = [],
  onSaveLink,
  onDeleteLink
}) {
  const [baseUrl, setBaseUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const campaignSlug = useMemo(() => slugify(campaignName), [campaignName]);

  const urlValidation = useMemo(() => {
    if (!baseUrl) return { valid: true };
    return validateUrl(baseUrl);
  }, [baseUrl]);

  const generatedUrl = useMemo(() => {
    if (!baseUrl || !source || !medium) return '';

    const params = new URLSearchParams();
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    params.set('utm_campaign', campaignSlug);
    if (term) params.set('utm_term', term);
    if (content) params.set('utm_content', content);

    try {
      const url = new URL(baseUrl);
      // Merge with existing params
      params.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
      return url.toString();
    } catch {
      return '';
    }
  }, [baseUrl, source, medium, campaignSlug, term, content]);

  const isValid = useMemo(() => {
    return urlValidation.valid && baseUrl && source && medium;
  }, [urlValidation.valid, baseUrl, source, medium]);

  const handleCopy = useCallback(async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generatedUrl]);

  const handleSave = useCallback(() => {
    if (!isValid || !onSaveLink) return;

    onSaveLink({
      id: Date.now().toString(),
      baseUrl,
      source,
      medium,
      campaign: campaignSlug,
      term,
      content,
      generatedUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0
    });

    // Reset form
    setBaseUrl('');
    setSource('');
    setMedium('');
    setTerm('');
    setContent('');
  }, [isValid, onSaveLink, baseUrl, source, medium, campaignSlug, term, content, generatedUrl]);

  const handleCopyLink = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return (
    <div className="utm-builder-panel">
      <div className="utm-builder-header">
        <div className="utm-builder-title">
          <LinkIcon fontSize="small" />
          UTM Link Builder
        </div>
        <button
          className="utm-help-btn"
          onClick={() => setShowHelp(!showHelp)}
          title="Help"
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
      </div>

      {showHelp && (
        <div className="utm-help-box">
          <p><strong>UTM Parameters</strong> help track campaign performance in analytics tools.</p>
          <ul>
            <li><code>utm_source</code> - Where traffic comes from (google, facebook)</li>
            <li><code>utm_medium</code> - Marketing medium (cpc, email, social)</li>
            <li><code>utm_campaign</code> - Campaign identifier (auto-generated)</li>
            <li><code>utm_term</code> - Paid search keywords (optional)</li>
            <li><code>utm_content</code> - Differentiate similar links (optional)</li>
          </ul>
        </div>
      )}

      <div className="utm-form">
        <div className="utm-field">
          <label className="utm-label">
            Base URL <span className="utm-required">*</span>
          </label>
          <input
            type="url"
            className={`utm-input ${!urlValidation.valid ? 'utm-input-error' : ''}`}
            placeholder="https://example.com/landing-page"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          {!urlValidation.valid && (
            <div className="utm-error">
              <ErrorOutlineIcon fontSize="small" />
              {urlValidation.error}
            </div>
          )}
        </div>

        <div className="utm-field-row">
          <div className="utm-field">
            <label className="utm-label">
              Source <span className="utm-required">*</span>
            </label>
            <select
              className="utm-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Select source...</option>
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="utm-field">
            <label className="utm-label">
              Medium <span className="utm-required">*</span>
            </label>
            <select
              className="utm-select"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
            >
              <option value="">Select medium...</option>
              {MEDIUMS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="utm-field">
          <label className="utm-label">Campaign Name (auto)</label>
          <input
            type="text"
            className="utm-input utm-input-readonly"
            value={campaignSlug}
            readOnly
          />
        </div>

        <div className="utm-field-row">
          <div className="utm-field">
            <label className="utm-label">Term (optional)</label>
            <input
              type="text"
              className="utm-input"
              placeholder="e.g., running shoes"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>

          <div className="utm-field">
            <label className="utm-label">Content (optional)</label>
            <input
              type="text"
              className="utm-input"
              placeholder="e.g., cta-button-a"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {generatedUrl && (
          <div className="utm-field">
            <label className="utm-label">Generated URL</label>
            <div className="utm-generated-url">
              {generatedUrl}
            </div>
          </div>
        )}

        <div className="utm-actions">
          <button
            className="utm-btn utm-btn-secondary"
            onClick={handleCopy}
            disabled={!generatedUrl}
          >
            {copied ? (
              <>
                <CheckCircleIcon fontSize="small" />
                Copied!
              </>
            ) : (
              <>
                <ContentCopyIcon fontSize="small" />
                Copy
              </>
            )}
          </button>

          <button
            className="utm-btn utm-btn-secondary"
            onClick={() => generatedUrl && window.open(generatedUrl, '_blank')}
            disabled={!generatedUrl}
          >
            <OpenInNewIcon fontSize="small" />
            Test
          </button>

          <button
            className="utm-btn utm-btn-primary"
            onClick={handleSave}
            disabled={!isValid}
          >
            <AddIcon fontSize="small" />
            Save Link
          </button>
        </div>
      </div>

      {savedLinks.length > 0 && (
        <div className="utm-saved-links">
          <div className="utm-saved-header">
            Saved Links
            <span className="utm-saved-count">{savedLinks.length}</span>
          </div>

          <div className="utm-saved-list">
            {savedLinks.map(link => (
              <div key={link.id} className="utm-link-card">
                <div className="utm-link-info">
                  <div className="utm-link-name">
                    {link.source} / {link.medium}
                    {link.content && ` / ${link.content}`}
                  </div>
                  <div className="utm-link-meta">
                    Created {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="utm-link-stats">
                  {link.clicks > 0 && (
                    <span className="utm-link-clicks">
                      {link.clicks.toLocaleString()} clicks
                    </span>
                  )}
                </div>
                <div className="utm-link-actions">
                  <button
                    className="utm-link-btn"
                    onClick={() => handleCopyLink(link.generatedUrl)}
                    title="Copy link"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </button>
                  {onDeleteLink && (
                    <button
                      className="utm-link-btn utm-link-btn-danger"
                      onClick={() => onDeleteLink(link.id)}
                      title="Delete link"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
