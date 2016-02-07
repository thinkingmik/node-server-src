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
    //uri: 'mongodb://172.17.0.2:27017/test'
    uri: 'mongodb://localhost:27017/test'
  }
}
