exports.up = (knex) =>
  knex.schema.createTable('click_stats', (t) => {
    t.integer('link_id').unsigned().notNullable().references('id').inTable('links').onDelete('CASCADE');
    t.date('date').notNullable();
    t.integer('count').unsigned().notNullable().defaultTo(0);
    t.primary(['link_id', 'date']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('click_stats');
