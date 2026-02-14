// pages/api/enterprise/capabilities/[id].js
// Enterprise Capability API - Individual operations
// Task EN-130

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const CAPABILITY_STATUS = ['active', 'developing', 'planned', 'retiring'];
const MATURITY_LEVELS = [1, 2, 3, 4, 5];
const STRATEGIC_IMPORTANCE = ['critical', 'high', 'medium', 'low'];
const INVESTMENT_PRIORITY = ['invest', 'maintain', 'divest'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Capability ID is required' });
  }

  // GET - Get single capability with related items
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username
         FROM artefacts a
         LEFT JOIN users u ON u.username = a.owner_id
         WHERE a.id = $1 AND a.artefact_type = 'enterprise_capability'`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Capability not found' });
      }

      const capability = result.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, capability.domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get children
      const childrenResult = await query(
        `SELECT id, name, custom_fields->>'status' as status, custom_fields->>'maturity_level' as maturity
         FROM artefacts
         WHERE custom_fields->>'parent_capability_id' = $1
           AND artefact_type = 'enterprise_capability'
         ORDER BY custom_fields->>'sort_order' NULLS LAST, name`,
        [id]
      );

      // Get parent
      let parent = null;
      if (capability.custom_fields?.parent_capability_id) {
        const parentResult = await query(
          `SELECT id, name FROM artefacts WHERE id = $1`,
          [capability.custom_fields.parent_capability_id]
        );
        parent = parentResult.rows[0] || null;
      }

      // Get linked services
      const servicesResult = await query(
        `SELECT a.id, a.name, a.custom_fields->>'service_type' as service_type
         FROM artefacts a
         JOIN artefact_relationships r ON r.to_artefact_id = a.id
         WHERE r.from_artefact_id = $1
           AND a.artefact_type = 'enterprise_service'`,
        [id]
      );

      // Get supporting applications
      const appsResult = await query(
        `SELECT a.id, a.name, a.custom_fields->>'application_type' as app_type
         FROM artefacts a
         JOIN artefact_relationships r ON r.to_artefact_id = a.id
         WHERE r.from_artefact_id = $1
           AND a.artefact_type = 'enterprise_application'`,
        [id]
      );

      return res.status(200).json({
        ...capability,
        parent,
        children: childrenResult.rows,
        linkedServices: servicesResult.rows,
        supportingApplications: appsResult.rows,
      });
    } catch (err) {
      console.error('Error fetching capability:', err);
      return res.status(500).json({ error: 'Failed to fetch capability' });
    }
  }

  // PUT - Update capability
  if (req.method === 'PUT') {
    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_capability'`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Capability not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const {
        name,
        description,
        status,
        parent_capability_id,
        maturity_level,
        strategic_importance,
        investment_priority,
        business_owner,
        supporting_applications,
        linked_services,
        sort_order,
        custom_fields,
      } = req.body;

      // Validate
      if (status && !CAPABILITY_STATUS.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Use: ${CAPABILITY_STATUS.join(', ')}` });
      }

      // Merge custom fields
      const mergedCustomFields = {
        ...existing.custom_fields,
        ...(custom_fields || {}),
        ...(status !== undefined && { status }),
        ...(parent_capability_id !== undefined && { parent_capability_id }),
        ...(maturity_level !== undefined && { maturity_level }),
        ...(strategic_importance !== undefined && { strategic_importance }),
        ...(investment_priority !== undefined && { investment_priority }),
        ...(business_owner !== undefined && { business_owner }),
        ...(supporting_applications !== undefined && { supporting_applications }),
        ...(linked_services !== undefined && { linked_services }),
        ...(sort_order !== undefined && { sort_order }),
      };

      const result = await query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          custom_fields = $3,
          updated_at = now()
        WHERE id = $4
        RETURNING *`,
        [
          name?.trim() || null,
          description,
          JSON.stringify(mergedCustomFields),
          id,
        ]
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating capability:', err);
      return res.status(500).json({ error: 'Failed to update capability' });
    }
  }

  // DELETE - Delete capability
  if (req.method === 'DELETE') {
    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_capability'`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Capability not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Check for children
      const childCount = await query(
        `SELECT COUNT(*) FROM artefacts WHERE custom_fields->>'parent_capability_id' = $1`,
        [id]
      );

      if (parseInt(childCount.rows[0].count) > 0) {
        return res.status(400).json({
          error: 'Cannot delete capability with children. Delete or reassign children first.',
          childCount: parseInt(childCount.rows[0].count),
        });
      }

      // Delete relationships
      await query(`DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`, [id]);

      // Delete capability
      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ message: 'Capability deleted successfully' });
    } catch (err) {
      console.error('Error deleting capability:', err);
      return res.status(500).json({ error: 'Failed to delete capability' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
