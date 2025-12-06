const neo4j = require('neo4j-driver');

let driver;

function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD must be set');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

async function runRead(query, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

async function runWrite(query, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

module.exports = {
  getDriver,
  runRead,
  runWrite
};
