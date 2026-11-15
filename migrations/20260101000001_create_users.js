exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('id');
    t.string('name', 100).notNullable();
    t.string('api_key', 64).notNullable().unique();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
