exports.up = (knex) =>
  knex.schema.createTable('links', (t) => {
    t.increments('id');
    // collate bin => case-sensitive, konsisten dengan aturan alias di aplikasi
    t.string('code', 30).notNullable().unique().collate('utf8mb4_bin');
    t.text('original_url').notNullable();
    t.integer('owner_id').unsigned().notNullable().references('id').inTable('users');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.dateTime('expires_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('owner_id');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('links');
