-- Jalankan di Supabase: SQL Editor > New query

create table if not exists members (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text unique not null,
  created_at timestamptz default now()
);

create table if not exists books (
  id         bigint generated always as identity primary key,
  title      text not null,
  author     text not null,
  created_at timestamptz default now()
);

create table if not exists loans (
  id          bigint generated always as identity primary key,
  member_id   bigint not null references members(id) on delete cascade,
  book_id     bigint not null references books(id) on delete cascade,
  loan_date   date not null default current_date,
  due_date    date not null,
  return_date date,
  status      text not null default 'Dipinjam'
              check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  created_at  timestamptz default now()
);

-- Data contoh
insert into members (name, email) values
  ('Ani Lestari', 'ani@example.com'),
  ('Budi Santoso', 'budi@example.com');

insert into books (title, author) values
  ('Laskar Pelangi', 'Andrea Hirata'),
  ('Bumi Manusia', 'Pramoedya Ananta Toer'),
  ('Negeri 5 Menara', 'Ahmad Fuadi');

insert into loans (member_id, book_id, loan_date, due_date, status) values
  (1, 1, current_date - 14, current_date - 7, 'Dipinjam'),
  (2, 2, current_date - 3,  current_date + 4, 'Dipinjam');
