module.exports = {
  development: {
    port: 3000,
    sessionSecret: 'm4bJ%T310Hof$9z',
    tokenLife: 3600, //seconds
    jwt: {
      enabled: true,
      ipcheck: false,
      uacheck: false,
      secretKey: 'K7pHX4OASe?c_lm',
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
