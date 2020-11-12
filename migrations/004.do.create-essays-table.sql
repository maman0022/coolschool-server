create table if not exists essays (
  id serial primary key not null,
  title text not null,
  date_created timestamptz not null default now(),
  course_id integer not null references courses(id),
  user_id integer not null references users(id),
  content text not null
);