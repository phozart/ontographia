// pages/api/ea/analysis/compliance.js
// EA Principle Compliance Checking API
// Task EN-096

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { checkPrincipleCompliance, checkModelCompliance } from '../../../../lib/ea-business-logic';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - Check compliance for a domain's model
  if (req.method === 'GET') {
    const { domainId, principleId } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Get all elements and relationships
      const [elementsResult, relationshipsResult] = await Promise.all([
        query(`SELECT * FROM ea_elements WHERE domain_id = $1`, [domainId]),
        query(`SELECT * FROM ea_relationships WHERE domain_id = $1`, [domainId]),
      ]);

      const elements = elementsResult.rows;
      const relationships = relationshipsResult.rows;

      // Get principles (if checking specific principle)
      let principles = [];
      if (principleId) {
        const principleResult = await query(
          `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'principle'`,
          [principleId]
        );
        if (principleResult.rows.length > 0) {
          principles = principleResult.rows;
        }
      } else {
        // Get all principles for the domain
        const principleResult = await query(
          `SELECT * FROM artefacts
           WHERE domain_id = $1 AND artefact_type = 'principle'
           ORDER BY name`,
          [domainId]
        );
        principles = principleResult.rows;
      }

      // Run model compliance check
      const compliance = checkModelCompliance(elements, relationships, principles);

      // Group violations by severity
      const bySeverity = {
        critical: [],
        warning: [],
        info: [],
      };

      compliance.violations.forEach(v => {
        const severity = v.severity || 'warning';
        if (bySeverity[severity]) {
          bySeverity[severity].push(v);
        }
      });

      return res.status(200).json({
        domainId,
        overallScore: compliance.overallScore,
        compliant: compliance.overallScore >= 80,
        totalElements: elements.length,
        totalRelationships: relationships.length,
        totalPrinciples: principles.length,
        violations: compliance.violations,
        bySeverity,
        summary: {
          criticalCount: bySeverity.critical.length,
          warningCount: bySeverity.warning.length,
          infoCount: bySeverity.info.length,
        },
        recommendations: compliance.recommendations || [],
      });
    } catch (err) {
      console.error('Error checking compliance:', err);
      return res.status(500).json({ error: 'Failed to check compliance' });
    }
  }

  // POST - Check compliance for specific element(s) against principles
  if (req.method === 'POST') {
    const { domainId, elementIds, principleIds } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Build query for elements
      let elementQuery = `SELECT * FROM ea_elements WHERE domain_id = $1`;
      const elementParams = [domainId];

      if (elementIds && elementIds.length > 0) {
        elementQuery += ` AND id = ANY($2)`;
        elementParams.push(elementIds);
      }

      const elementsResult = await query(elementQuery, elementParams);
      const elements = elementsResult.rows;

      // Get principles
      let principles = [];
      if (principleIds && principleIds.length > 0) {
        const principleResult = await query(
          `SELECT * FROM artefacts WHERE id = ANY($1) AND artefact_type = 'principle'`,
          [principleIds]
        );
        principles = principleResult.rows;
      } else {
        const principleResult = await query(
          `SELECT * FROM artefacts WHERE domain_id = $1 AND artefact_type = 'principle'`,
          [domainId]
        );
        principles = principleResult.rows;
      }

      // Check each element against each principle
      const results = [];

      for (const element of elements) {
        const elementResults = {
          elementId: element.id,
          elementName: element.name,
          elementType: element.element_type,
          principleResults: [],
          overallCompliant: true,
        };

        for (const principle of principles) {
          const compliance = checkPrincipleCompliance(element, principle);
          elementResults.principleResults.push({
            principleId: principle.id,
            principleName: principle.name,
            ...compliance,
          });
          if (!compliance.compliant) {
            elementResults.overallCompliant = false;
          }
        }

        results.push(elementResults);
      }

      const compliantCount = results.filter(r => r.overallCompliant).length;

      return res.status(200).json({
        domainId,
        totalElements: results.length,
        totalPrinciples: principles.length,
        compliantElements: compliantCount,
        nonCompliantElements: results.length - compliantCount,
        complianceRate: results.length > 0 ? (compliantCount / results.length * 100).toFixed(1) : 100,
        results,
      });
    } catch (err) {
      console.error('Error checking element compliance:', err);
      return res.status(500).json({ error: 'Failed to check element compliance' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
