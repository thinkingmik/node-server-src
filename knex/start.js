var config = require('../configs/config');
var knex = require('knex')(config.knex);

knex.migrate.rollback()
  .then(function(res) {
    console.log('[OK] Dropped all tables with success!');

    return knex.migrate.latest();
  })
  .then(function(res) {
    console.log('[OK] Migration run with success!');
  })
  .catch(function(err) {
    console.error('[ERROR] ' + err);
  });
