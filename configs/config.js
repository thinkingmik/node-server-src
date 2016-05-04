module.exports = {
  development: {
    port: 3000,
    sessionSecretKey: 'm4bJ%T310Hof$9z',
    logger: {
      level: 'debug'
    },
    crypto: {
      secretKey: 'o!rDE(Qbrq7u4OV',
      algorithm: 'AES-256-CBC',
      inputEncoding: 'utf8',
      outputEncoding: 'base64'
    },
    token: {
      life: 3600, //seconds
      length: 32, //bytes
      jwt: {
        enabled: false,
        ipcheck: false,
        uacheck: false,
        secretKey: 'K7pHX4OASe?c&lm',
        cert: null,
        algorithm: 'RS256'
      }
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
