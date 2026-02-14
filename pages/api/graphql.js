// pages/api/graphql.js
// GraphQL API endpoint for Ontographia
// Provides a single GraphQL endpoint for all graph operations

import { createYoga } from 'graphql-yoga';
import { schema, createContext } from '../../lib/graphql';

/**
 * GraphQL Yoga server configuration
 *
 * Features:
 * - GraphQL Playground available at /api/graphql in development
 * - Batching support via DataLoaders
 * - Authentication via x-user and x-role headers
 * - CORS enabled for cross-origin requests
 */
const yoga = createYoga({
  // Schema with all type definitions and resolvers
  schema,

  // Context factory called for each request
  context: createContext,

  // GraphQL endpoint path
  graphqlEndpoint: '/api/graphql',

  // Landing page configuration
  landingPage: process.env.NODE_ENV === 'development',

  // Enable GraphiQL in development
  graphiql: process.env.NODE_ENV === 'development' ? {
    title: 'Ontographia GraphQL',
    defaultQuery: `# Welcome to Ontographia GraphQL API
#
# Try these example queries:

# Get all relationship types (KG-002)
query RelationshipTypes {
  relationshipTypes {
    id
    label
    inverse
    spaces
    category
    description
  }
}

# Search artefacts (US-007)
query SearchArtefacts {
  searchArtefacts(query: "requirement", limit: 10) {
    artefact {
      id
      name
      artefactType
      space
      status
    }
    score
    matchedField
  }
}

# Trace relationships (US-005)
# Replace <artefact-id> with an actual UUID
# query Trace {
#   trace(artefactId: "<artefact-id>", direction: BOTH, depth: 3) {
#     source {
#       id
#       name
#     }
#     nodes {
#       id
#       name
#       artefactType
#       space
#     }
#     edges {
#       fromArtefactId
#       toArtefactId
#       relationshipType
#     }
#     summary {
#       upstreamCount
#       downstreamCount
#       totalConnections
#     }
#   }
# }

# Impact analysis
# query Impact {
#   impactAnalysis(artefactId: "<artefact-id>", direction: DOWNSTREAM) {
#     source {
#       id
#       name
#     }
#     impact {
#       total
#       direct
#       indirect
#       riskScore {
#         level
#         score
#         factors
#       }
#     }
#   }
# }
`,
  } : false,

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user', 'x-role'],
    methods: ['GET', 'POST', 'OPTIONS'],
  },

  // Disable body parsing - graphql-yoga handles it
  fetchAPI: {
    Response,
  },

  // Logging
  logging: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',

  // Health check endpoint
  healthCheckEndpoint: '/api/graphql/health',

  // Mask errors in production
  maskedErrors: process.env.NODE_ENV === 'production',

  // Plugins
  plugins: [
    // Request timing plugin
    {
      onExecute({ args }) {
        const start = Date.now();
        return {
          onExecuteDone() {
            const duration = Date.now() - start;
            if (process.env.NODE_ENV === 'development' && duration > 100) {
              console.log(`GraphQL execution took ${duration}ms`);
            }
          },
        };
      },
    },
  ],
});

/**
 * Next.js API route configuration
 * Disable body parsing as graphql-yoga handles it
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Export the yoga handler for Next.js
 */
export default yoga;
