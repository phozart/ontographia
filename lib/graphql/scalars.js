// lib/graphql/scalars.js
// Custom GraphQL scalar type definitions for Ontographia

import { GraphQLScalarType, Kind } from 'graphql';

/**
 * DateTime scalar for handling timestamps
 * Accepts and returns ISO 8601 date strings
 */
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A date-time string in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',

  // Value from resolvers to client
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      // Validate and return ISO string
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`DateTime cannot serialize invalid date string: ${value}`);
      }
      return date.toISOString();
    }
    throw new Error(`DateTime cannot serialize value of type ${typeof value}`);
  },

  // Value from client input (variables)
  parseValue(value) {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`DateTime cannot parse invalid date string: ${value}`);
      }
      return date;
    }
    throw new Error(`DateTime cannot parse value of type ${typeof value}`);
  },

  // Value from client input (inline)
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error(`DateTime cannot parse invalid date string: ${ast.value}`);
      }
      return date;
    }
    throw new Error(`DateTime cannot parse literal of kind ${ast.kind}`);
  },
});

/**
 * JSON scalar for handling arbitrary JSON data
 * Used for customFields, metadata, and other flexible data structures
 */
export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value - object, array, string, number, boolean, or null',

  // Value from resolvers to client
  serialize(value) {
    return value;
  },

  // Value from client input (variables)
  parseValue(value) {
    return value;
  },

  // Value from client input (inline)
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return ast.value;
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT:
        return parseObjectLiteral(ast);
      case Kind.LIST:
        return ast.values.map((v) => JSONScalar.parseLiteral(v));
      case Kind.NULL:
        return null;
      default:
        throw new Error(`JSON cannot parse literal of kind ${ast.kind}`);
    }
  },
});

/**
 * Helper to parse object literals in GraphQL AST
 */
function parseObjectLiteral(ast) {
  const obj = {};
  ast.fields.forEach((field) => {
    obj[field.name.value] = JSONScalar.parseLiteral(field.value);
  });
  return obj;
}

/**
 * UUID scalar for validating UUID format
 */
export const UUIDScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'A UUID string in standard format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',

  serialize(value) {
    if (typeof value === 'string' && isValidUUID(value)) {
      return value;
    }
    throw new Error(`UUID cannot serialize invalid value: ${value}`);
  },

  parseValue(value) {
    if (typeof value === 'string' && isValidUUID(value)) {
      return value;
    }
    throw new Error(`UUID cannot parse invalid value: ${value}`);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING && isValidUUID(ast.value)) {
      return ast.value;
    }
    throw new Error(`UUID cannot parse literal: ${ast.kind === Kind.STRING ? ast.value : ast.kind}`);
  },
});

/**
 * UUID validation regex
 */
function isValidUUID(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * All custom scalars bundled together
 */
export const scalars = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
  UUID: UUIDScalar,
};

export default scalars;
