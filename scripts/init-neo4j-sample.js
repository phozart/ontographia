/**
 * Seed Neo4j with sample Ontographia data.
 * Theme: Python language concepts -> rules -> philosophical questions.
 *
 * Usage:
 *   NEO4J_URI=bolt://neo4j:7687 NEO4J_USER=neo4j NEO4J_PASSWORD=pass node scripts/init-neo4j-sample.js
 */
const neo4j = require('neo4j-driver');

const {
  NEO4J_URI = 'bolt://neo4j:7687',
  NEO4J_USER = 'neo4j',
  NEO4J_PASSWORD = 'testpassword',
} = process.env;

const nodes = [
  { id: 'lang-python', name: 'Python Language', type: 'Language', layer: 'Concept', attributes: { paradigm: 'multi-paradigm', philosophy: 'readability matters' } },
  { id: 'feat-comprehension', name: 'List Comprehension', type: 'Language Feature', layer: 'Syntax', attributes: { pattern: 'for-if expression', benefit: 'expressive + concise' } },
  { id: 'feat-generator', name: 'Generator', type: 'Language Feature', layer: 'Runtime', attributes: { pattern: 'yield', benefit: 'lazy evaluation' } },
  { id: 'feat-lambda', name: 'Lambda', type: 'Language Feature', layer: 'Syntax', attributes: { arity: 'inline function', caution: 'prefer named functions when clearer' } },
  { id: 'feat-typing', name: 'Typing', type: 'Language Feature', layer: 'Type System', attributes: { mode: 'gradual', peps: ['484', '526'] } },
  { id: 'fn-map', name: 'map', type: 'Function', layer: 'Built-in', attributes: { arity: '2+', category: 'higher-order' } },
  { id: 'fn-filter', name: 'filter', type: 'Function', layer: 'Built-in', attributes: { arity: '2', category: 'higher-order' } },
  { id: 'fn-reduce', name: 'reduce', type: 'Function', layer: 'Built-in', attributes: { arity: '2+', category: 'fold', module: 'functools' } },
  { id: 'fn-decorator', name: '@decorator', type: 'Function', layer: 'Meta', attributes: { purpose: 'wrap behavior', pattern: 'higher-order' } },
  { id: 'rule-elegance', name: 'Rule of Elegance', type: 'Rule', layer: 'Principle', attributes: { quote: 'Simple is better than complex.' } },
  { id: 'rule-truth', name: 'Rule of Truth', type: 'Rule', layer: 'Principle', attributes: { quote: 'In the face of ambiguity, refuse the temptation to guess.' } },
  { id: 'rule-explicit', name: 'Rule of Explicitness', type: 'Rule', layer: 'Principle', attributes: { quote: 'Explicit is better than implicit.' } },
  { id: 'rule-clarity', name: 'Rule of Clarity', type: 'Rule', layer: 'Principle', attributes: { quote: 'Readability counts.' } },
  { id: 'rule-generator', name: 'Rule of Laziness', type: 'Rule', layer: 'Principle', attributes: { idea: 'Do not compute before you must.' } },
  { id: 'question-truth', name: 'What is truth?', type: 'Philosophical Question', layer: 'Epistemology', attributes: { scope: 'knowledge', angle: 'correspondence vs coherence' } },
  { id: 'question-meaning', name: 'How does meaning emerge from rules?', type: 'Philosophical Question', layer: 'Philosophy of Language', attributes: { scope: 'semantics', angle: 'use + intention' } },
  { id: 'question-ethics', name: 'Should code embody ethics?', type: 'Philosophical Question', layer: 'Ethics', attributes: { scope: 'practice', angle: 'values in tooling' } },
  { id: 'question-mind', name: 'Is computation understanding?', type: 'Philosophical Question', layer: 'Mind', attributes: { scope: 'cognition', angle: 'symbol grounding' } },
  { id: 'example-recurse', name: 'Recursive Fibonacci', type: 'Example', layer: 'Code', attributes: { complexity: 'exponential', lesson: 'prefer dynamic programming' } },
  { id: 'example-pipeline', name: 'Data Pipeline', type: 'Example', layer: 'Code', attributes: { pattern: 'map/filter/reduce', goal: 'transform stream' } },
];

const rels = [
  ['lang-python', 'feat-comprehension', 'HAS_FEATURE'],
  ['lang-python', 'feat-generator', 'HAS_FEATURE'],
  ['lang-python', 'feat-lambda', 'HAS_FEATURE'],
  ['lang-python', 'feat-typing', 'HAS_FEATURE'],
  ['lang-python', 'fn-map', 'PROVIDES'],
  ['lang-python', 'fn-filter', 'PROVIDES'],
  ['lang-python', 'fn-reduce', 'PROVIDES'],
  ['lang-python', 'fn-decorator', 'PROVIDES'],
  ['feat-comprehension', 'fn-map', 'INSPIRES'],
  ['feat-comprehension', 'fn-filter', 'INSPIRES'],
  ['feat-generator', 'rule-generator', 'EMBODIES'],
  ['feat-generator', 'rule-elegance', 'SUPPORTS'],
  ['feat-typing', 'rule-explicit', 'SUPPORTS'],
  ['feat-typing', 'rule-truth', 'SUPPORTS'],
  ['fn-map', 'rule-elegance', 'ILLUSTRATES'],
  ['fn-filter', 'rule-elegance', 'ILLUSTRATES'],
  ['fn-reduce', 'rule-clarity', 'CHALLENGES'],
  ['fn-decorator', 'rule-explicit', 'CHALLENGES'],
  ['rule-elegance', 'question-meaning', 'INFORMS'],
  ['rule-truth', 'question-truth', 'INFORMS'],
  ['rule-explicit', 'question-meaning', 'INFORMS'],
  ['rule-clarity', 'question-meaning', 'INFORMS'],
  ['rule-generator', 'question-mind', 'RAISES'],
  ['example-recurse', 'fn-reduce', 'CONTRASTS'],
  ['example-pipeline', 'fn-map', 'USES'],
  ['example-pipeline', 'fn-filter', 'USES'],
  ['example-pipeline', 'rule-clarity', 'SEEKS'],
  ['question-ethics', 'rule-clarity', 'TENSIONS'],
  ['question-ethics', 'lang-python', 'CHALLENGES'],
];

async function main() {
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (n:Entity) REQUIRE n.id IS UNIQUE');

    for (const n of nodes) {
      await session.run(
        `
        MERGE (e:Entity {id: $id})
        SET e.name = $name,
            e.type = $type,
            e.layer = $layer,
            e.attributes = $attributes
        `,
        n
      );
    }

    for (const [from, to, type] of rels) {
      const relType = type.replace(/[^A-Z0-9_]/g, '_');
      await session.run(
        `
        MATCH (a:Entity {id: $from}), (b:Entity {id: $to})
        MERGE (a)-[r:${relType}]->(b)
        `,
        { from, to }
      );
    }

    console.log('Seed data created in Neo4j.');
  } catch (err) {
    console.error('Failed to seed Neo4j', err);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
