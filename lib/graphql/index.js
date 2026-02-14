// lib/graphql/index.js
// Main GraphQL module export for Ontographia
// Provides the configured GraphQL schema with resolvers

import { createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { createDataLoaders } from './dataloaders';
import { scalars } from './scalars';
import {
  RELATIONSHIP_TYPES,
  getAllRelationshipTypes,
  getRelationshipTypesForSpace,
  getRelationshipTypesByCategory,
  getCategories,
  isValidRelationship,
  isValidRelationshipType,
  getInverseLabel,
} from './relationshipTypes';

/**
 * Create the GraphQL schema with all type definitions and resolvers
 * This is the main export used by the GraphQL API endpoint
 */
export const schema = createSchema({
  typeDefs,
  resolvers,
});

/**
 * Export all GraphQL components for flexibility
 */
export {
  // Schema and resolvers
  typeDefs,
  resolvers,
  createContext,
  createDataLoaders,

  // Scalars
  scalars,

  // Relationship type registry (KG-002)
  RELATIONSHIP_TYPES,
  getAllRelationshipTypes,
  getRelationshipTypesForSpace,
  getRelationshipTypesByCategory,
  getCategories,
  isValidRelationship,
  isValidRelationshipType,
  getInverseLabel,
};

export default schema;
