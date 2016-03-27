var config = require('../configs/config');
var knex = require('knex')(config.knex);

knex.migrate.latest({}).finally(function () {
  knex.destroy()
})
