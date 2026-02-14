/**
 * DataProductCard - Individual data product card
 *
 * Displays a data product with:
 * - Name and description (truncated)
 * - Classification badge (color-coded)
 * - Status badge
 * - Data domain tag
 * - Input/output port count indicators
 * - Health score bar
 *
 * @module components/spaces/enterprise/data/DataProductCard
 */

import {
  DATA_PRODUCT_STATUS,
  DATA_PRODUCT_CLASSIFICATION,
  calculateHealthScore,
} from '@/lib/data-product-types';
import styles from './data.module.css';

export default function DataProductCard({ product, onClick, selected = false }) {
  const classification = DATA_PRODUCT_CLASSIFICATION[product.classification || 'source_aligned'];
  const status = DATA_PRODUCT_STATUS[product.status || 'draft'];

  const inputPorts = product.input_ports || [];
  const outputPorts = product.output_ports || [];

  const health = calculateHealthScore(product.health_metrics);

  return (
    <div
      className={`${styles.productCard} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      style={{ '--card-accent': classification?.color }}
    >
      {/* Header: name + status */}
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h4 className={styles.cardName}>{product.name}</h4>
          <span
            className={styles.statusBadge}
            style={{ background: `${status?.color}20`, color: status?.color }}
          >
            {status?.label}
          </span>
        </div>
      </div>

      {/* Badges: classification + domain */}
      <div className={styles.cardBadges}>
        <span
          className={styles.classificationBadge}
          style={{ background: `${classification?.color}20`, color: classification?.color }}
        >
          {classification?.label}
        </span>
        {product.data_domain_name && (
          <span className={styles.domainTag}>
            {product.data_domain_name}
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className={styles.cardDescription}>{product.description}</p>
      )}

      {/* Meta */}
      <div className={styles.cardMeta}>
        {product.owner && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Owner</span>
            <span className={styles.metaValue}>{product.owner}</span>
          </div>
        )}

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Ports</span>
          <div className={styles.portIndicators}>
            <span className={styles.portCount}>
              <span className={styles.portIcon}>&#8594;</span>
              {inputPorts.length} in
            </span>
            <span className={styles.portCount}>
              <span className={styles.portIcon}>&#8592;</span>
              {outputPorts.length} out
            </span>
          </div>
        </div>

        {product.version && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Version</span>
            <span className={styles.metaValue}>{product.version}</span>
          </div>
        )}
      </div>

      {/* Health Score */}
      <div className={styles.healthBar}>
        <span className={styles.healthLabel}>Health</span>
        <div className={styles.healthTrack}>
          <div
            className={styles.healthFill}
            style={{
              width: `${health.score}%`,
              background: health.color,
            }}
          />
        </div>
        <span className={styles.healthValue} style={{ color: health.color }}>
          {health.score}
        </span>
        <span className={styles.healthRating} style={{ color: health.color }}>
          {health.rating}
        </span>
      </div>
    </div>
  );
}
