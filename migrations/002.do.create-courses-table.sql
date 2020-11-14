create table if not exists courses (
  id serial primary key not null,
  title text not null,
  date_created timestamptz not null default now(),
  user_id integer not null references users(id)on delete cascade
);