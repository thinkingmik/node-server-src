module.exports = {
  sessionSecret: 'SuperSecretSessionKey',
  tokenLife: 3600, //seconds
  port: 3000,
  jwt: {
    enabled: true,
    ipcheck: false,
    secretKey: 'SuperSecret',
    cert: null,
    algorithm: 'RS256'
  },
  mongoose: {
    uri: 'mongodb://localhost:27017/test'
  },
  knex: {
    client: 'pg',
    connection: 'postgres://postgres:postgres@localhost:5432/node-server-src?charset=utf-8&ssl=true',
    pool: { min: 2, max: 10 },
    debug: false
  }
}
