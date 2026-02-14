// pages/api/blueprint/initiatives/ai-import.js
// API endpoint for importing AI-generated initiative data

import { blueprintRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { parseAndValidate } from '../../../../lib/blueprint/ai-import-schema';
import { transformToInitiativeData } from '../../../../lib/blueprint/ai-import-transformer';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId } = req.query;
  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  // Check domain access
  const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'edit');
  if (!hasAccess) {
    return res.status(403).json({ error: accessError || 'Access denied' });
  }

  try {
    const {
      initiativeId,      // Optional: if provided, updates existing initiative
      jsonData,          // Raw JSON string from AI
      parsedData,        // Pre-parsed data (if already validated client-side)
      selectedSections,  // Array of section IDs to import
      basicInfo,         // Basic info for new initiative (name, etc.)
    } = req.body;

    // Validate request
    if (!jsonData && !parsedData) {
      return res.status(400).json({
        error: 'Either jsonData or parsedData is required',
      });
    }

    // Parse and validate if raw JSON provided
    let validated;
    if (jsonData) {
      validated = parseAndValidate(jsonData);
      if (!validated.valid) {
        return res.status(400).json({
          error: 'Invalid AI response JSON',
          validation: {
            errors: validated.errors,
            warnings: validated.warnings,
          },
        });
      }
    } else {
      // Use pre-parsed data (trust client validation)
      validated = { sanitized: parsedData, valid: true, warnings: [] };
    }

    // Transform to initiative data
    const sections = selectedSections || Object.keys(validated.sanitized);
    const initiativeData = transformToInitiativeData(validated.sanitized, sections);

    let result;

    if (initiativeId) {
      // Update existing initiative
      const existing = await blueprintRepository.findById(initiativeId);
      if (!existing) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Merge existing data with imported data
      const mergedData = mergeInitiativeData(existing, initiativeData);
      result = await blueprintRepository.update(initiativeId, {
        ...mergedData,
        updatedBy: user,
      });

      return res.status(200).json({
        success: true,
        initiative: result,
        imported: {
          sections,
          warnings: validated.warnings,
        },
      });
    } else {
      // Create new initiative
      if (!basicInfo?.name) {
        return res.status(400).json({
          error: 'basicInfo.name is required when creating a new initiative',
        });
      }

      // Prepare new initiative data
      const newInitiative = {
        domainId,
        name: basicInfo.name,
        description: initiativeData.ideaData?.description || basicInfo.description || '',
        stage: 'idea',
        submitterId: user,
        createdBy: user,
        ...initiativeData,
      };

      result = await blueprintRepository.create(newInitiative);

      return res.status(201).json({
        success: true,
        initiative: result,
        imported: {
          sections,
          warnings: validated.warnings,
        },
      });
    }
  } catch (err) {
    return errorResponse(res, 500, 'Failed to import AI data', err);
  }
}

/**
 * Merge imported data with existing initiative data
 * Imported data takes precedence, but existing data is preserved if not overwritten
 */
function mergeInitiativeData(existing, imported) {
  const merged = {};

  // Merge ideaData
  if (imported.ideaData) {
    merged.ideaData = {
      ...existing.idea,
      ...imported.ideaData,
    };
  }

  // Merge exploreData
  if (imported.exploreData) {
    merged.exploreData = {
      ...existing.explore,
      ...imported.exploreData,
      // Deep merge market_sizing
      market_sizing: imported.exploreData.market_sizing
        ? { ...existing.explore?.market_sizing, ...imported.exploreData.market_sizing }
        : existing.explore?.market_sizing,
      // Merge competitors (add new, preserve existing)
      competitors: mergeArrayById(existing.explore?.competitors, imported.exploreData.competitors),
      // Merge customer_segments
      customer_segments: mergeArrayById(existing.explore?.customer_segments, imported.exploreData.customer_segments),
      // Deep merge PESTLE
      pestle: imported.exploreData.pestle
        ? mergePESTLE(existing.explore?.pestle, imported.exploreData.pestle)
        : existing.explore?.pestle,
    };
  }

  // Merge assessData
  if (imported.assessData) {
    merged.assessData = {
      ...existing.assess,
      ...imported.assessData,
    };
  }

  // Merge caseData
  if (imported.caseData) {
    merged.caseData = {
      ...existing.case,
      ...imported.caseData,
      // Deep merge financials
      financials: imported.caseData.financials
        ? { ...existing.case?.financials, ...imported.caseData.financials }
        : existing.case?.financials,
      // Merge options and risks
      options: mergeArrayById(existing.case?.options, imported.caseData.options),
      risks: mergeArrayById(existing.case?.risks, imported.caseData.risks),
    };
  }

  // Merge canvasData
  if (imported.canvasData) {
    merged.canvasData = {
      ...existing.canvas,
      ...imported.canvasData,
    };
  }

  // Merge customFields
  if (imported.customFields) {
    merged.customFields = {
      ...existing.custom_fields,
      ...imported.customFields,
    };
  }

  // Set horizon if provided
  if (imported.horizon) {
    merged.horizon = imported.horizon;
  }

  return merged;
}

/**
 * Merge arrays by ID, imported items override existing with same ID
 */
function mergeArrayById(existing = [], imported = []) {
  if (!imported || imported.length === 0) return existing;
  if (!existing || existing.length === 0) return imported;

  const existingMap = new Map(existing.map(item => [item.id, item]));
  imported.forEach(item => {
    existingMap.set(item.id, item);
  });
  return Array.from(existingMap.values());
}

/**
 * Merge PESTLE data (combine arrays, deduplicate)
 */
function mergePESTLE(existing = {}, imported = {}) {
  const categories = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];
  const merged = {};

  categories.forEach(cat => {
    const existingItems = existing[cat] || [];
    const importedItems = imported[cat] || [];
    // Combine and deduplicate
    merged[cat] = [...new Set([...existingItems, ...importedItems])];
  });

  return merged;
}
