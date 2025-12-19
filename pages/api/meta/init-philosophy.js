// pages/api/meta/init-philosophy.js
// Initialize PostgreSQL tables for Philosophy Studio

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for initialisation' });
  }

  try {
    // Create phil_inquiries table (similar to mms_situations)
    await query(`
      CREATE TABLE IF NOT EXISTS phil_inquiries (
        id SERIAL PRIMARY KEY,
        domain_id INTEGER,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        central_question TEXT,
        tags JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'exploring',
        active_lens VARCHAR(100) DEFAULT 'concept-clarification',
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_phil_inquiries_domain ON phil_inquiries(domain_id);
      CREATE INDEX IF NOT EXISTS idx_phil_inquiries_user ON phil_inquiries(user_id);
      CREATE INDEX IF NOT EXISTS idx_phil_inquiries_status ON phil_inquiries(status);
    `);

    // Create phil_elements table
    await query(`
      CREATE TABLE IF NOT EXISTS phil_elements (
        id SERIAL PRIMARY KEY,
        inquiry_id INTEGER NOT NULL REFERENCES phil_inquiries(id) ON DELETE CASCADE,
        element_type VARCHAR(100) NOT NULL,
        subtype VARCHAR(100),
        content TEXT NOT NULL,
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_phil_elements_inquiry ON phil_elements(inquiry_id);
      CREATE INDEX IF NOT EXISTS idx_phil_elements_type ON phil_elements(element_type);
    `);

    // Create phil_relationships table
    await query(`
      CREATE TABLE IF NOT EXISTS phil_relationships (
        id SERIAL PRIMARY KEY,
        inquiry_id INTEGER NOT NULL REFERENCES phil_inquiries(id) ON DELETE CASCADE,
        from_element_id INTEGER NOT NULL REFERENCES phil_elements(id) ON DELETE CASCADE,
        to_element_id INTEGER NOT NULL REFERENCES phil_elements(id) ON DELETE CASCADE,
        relationship_type VARCHAR(100) NOT NULL,
        label VARCHAR(255),
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_phil_relationships_inquiry ON phil_relationships(inquiry_id);
      CREATE INDEX IF NOT EXISTS idx_phil_relationships_from ON phil_relationships(from_element_id);
      CREATE INDEX IF NOT EXISTS idx_phil_relationships_to ON phil_relationships(to_element_id);
    `);

    // Create phil_reflections table
    await query(`
      CREATE TABLE IF NOT EXISTS phil_reflections (
        id SERIAL PRIMARY KEY,
        inquiry_id INTEGER NOT NULL REFERENCES phil_inquiries(id) ON DELETE CASCADE,
        reflection_type VARCHAR(100) DEFAULT 'clarity',
        content TEXT NOT NULL,
        related_element_ids JSONB DEFAULT '[]',
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_phil_reflections_inquiry ON phil_reflections(inquiry_id);
    `);

    return res.status(200).json({
      ok: true,
      message: 'Philosophy Studio tables initialized successfully'
    });
  } catch (err) {
    console.error('Error initializing philosophy tables:', err);
    return res.status(500).json({ error: 'Failed to initialize philosophy tables', details: err.message });
  }
}
