module.exports = {
  development: {
    port: 3000,
    logLevel: 'debug',
    sessionSecretKey: 'm4bJ%T310Hof$9z',
    crypto: {
      secretKey: 'K7pHX4OASe?c&lm',
      algorithm: 'AES-256-CBC',
      inputEncoding: 'utf8',
      outputEncoding: 'base64'
    },
    tokenLife: 3600, //seconds
    jwt: {
      enabled: true,
      ipcheck: false,
      uacheck: false,
      secretKey: 'K7pHX4OASe?c&lm',
      cert: null,
      algorithm: 'RS256'
    },
    knex: {
      client: 'pg',
      connection: 'postgres://postgres:postgres@localhost:5432/node-server-src?charset=utf-8&ssl=true',
      pool: { min: 2, max: 10 },
      debug: false,
      migrations: {
        directory: './knex/migrations',
        tableName: 'migrations'
      },
      seeds: {
        directory: './knex/seeds'
      }
    }
  },
  production: {

  }
}
