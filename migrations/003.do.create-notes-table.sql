create table if not exists notes (
  id serial primary key not null,
  title text not null,
  date_created timestamptz not null default now(),
  course_id integer not null references courses(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  content text not null
);