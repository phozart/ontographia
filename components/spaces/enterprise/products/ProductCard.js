/**
 * Product Card
 *
 * Displays a product with lifecycle and performance indicators
 */

import { useEnterprise } from '../EnterpriseContext';
import styles from './products.module.css';

export function ProductCard({ product, compact = false }) {
  const { setSelectedArtefact, setActiveView } = useEnterprise();

  const handleClick = () => {
    setSelectedArtefact(product);
    setActiveView('product-detail');
  };

  const getLifecycleClass = (lifecycle) => {
    switch (lifecycle) {
      case 'introduction': return styles.lifecycleIntroduction;
      case 'growth': return styles.lifecycleGrowth;
      case 'maturity': return styles.lifecycleMaturity;
      case 'decline': return styles.lifecycleDecline;
      case 'retired': return styles.lifecycleRetired;
      default: return '';
    }
  };

  const getLifecycleIcon = (lifecycle) => {
    switch (lifecycle) {
      case 'introduction': return '🌱';
      case 'growth': return '📈';
      case 'maturity': return '⭐';
      case 'decline': return '📉';
      case 'retired': return '🏁';
      default: return '📦';
    }
  };

  if (compact) {
    return (
      <div className={styles.compactCard} onClick={handleClick}>
        <span className={styles.lifecycleIcon}>
          {getLifecycleIcon(product.lifecycle)}
        </span>
        <div className={styles.compactContent}>
          <span className={styles.compactName}>{product.name}</span>
          {product.category && (
            <span className={styles.compactCategory}>{product.category}</span>
          )}
        </div>
        {product.revenue && (
          <span className={styles.compactRevenue}>
            ${(product.revenue / 1000000).toFixed(1)}M
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <span className={styles.lifecycleIcon}>
          {getLifecycleIcon(product.lifecycle)}
        </span>
        <span className={`${styles.lifecycleBadge} ${getLifecycleClass(product.lifecycle)}`}>
          {product.lifecycle || 'Unknown'}
        </span>
      </div>

      <h4 className={styles.cardTitle}>{product.name}</h4>

      {product.description && (
        <p className={styles.cardDescription}>
          {product.description.length > 120
            ? `${product.description.slice(0, 120)}...`
            : product.description}
        </p>
      )}

      <div className={styles.cardMeta}>
        {product.category && (
          <span className={styles.metaItem}>
            Category: {product.category}
          </span>
        )}
        {product.owner && (
          <span className={styles.metaItem}>
            Owner: {product.owner}
          </span>
        )}
        {product.launchDate && (
          <span className={styles.metaItem}>
            Launched: {new Date(product.launchDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Performance Metrics */}
      {(product.revenue || product.customers || product.satisfaction) && (
        <div className={styles.metrics}>
          {product.revenue && (
            <div className={styles.metric}>
              <span className={styles.metricValue}>
                ${(product.revenue / 1000000).toFixed(1)}M
              </span>
              <span className={styles.metricLabel}>Revenue</span>
            </div>
          )}
          {product.customers && (
            <div className={styles.metric}>
              <span className={styles.metricValue}>
                {product.customers.toLocaleString()}
              </span>
              <span className={styles.metricLabel}>Customers</span>
            </div>
          )}
          {product.satisfaction && (
            <div className={styles.metric}>
              <span className={styles.metricValue}>
                {product.satisfaction}%
              </span>
              <span className={styles.metricLabel}>Satisfaction</span>
            </div>
          )}
        </div>
      )}

      {/* Linked Services */}
      {product.services && product.services.length > 0 && (
        <div className={styles.linkedServices}>
          <span className={styles.linkedLabel}>Services:</span>
          {product.services.slice(0, 3).map((svc, i) => (
            <span key={i} className={styles.linkedItem}>{svc}</span>
          ))}
          {product.services.length > 3 && (
            <span className={styles.linkedMore}>
              +{product.services.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
