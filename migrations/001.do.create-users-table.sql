create table if not exists users (
  id serial primary key not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  pw text not null,
  date_created timestamptz not null default now()
);