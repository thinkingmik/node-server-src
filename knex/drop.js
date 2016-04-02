var config = require('../configs/config');
var knex = require('knex')(config.knex);

knex.migrate.rollback()
  .then(function(res) {
    console.log('[OK] Dropped all tables with success!');
  })
  .catch(function(err) {
    console.error('[ERROR] ' + err);
  });
