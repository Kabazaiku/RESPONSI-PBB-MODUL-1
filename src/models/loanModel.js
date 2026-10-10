const supabase = require('../config/supabase');

// Ambil data peminjaman beserta nama anggota dan judul buku
const SELECT = '*, members(name, email), books(title, author)';
const today = () => new Date().toISOString().slice(0, 10);

// Tandai otomatis peminjaman yang lewat jatuh tempo sebagai "Terlambat"
const markLate = () =>
  supabase
    .from('loans')
    .update({ status: 'Terlambat' })
    .eq('status', 'Dipinjam')
    .lt('due_date', today());

const findAll = ({ status, member_id, book_id } = {}) => {
  let q = supabase.from('loans').select(SELECT).order('id', { ascending: true });
  if (status) q = q.eq('status', status);
  if (member_id) q = q.eq('member_id', member_id);
  if (book_id) q = q.eq('book_id', book_id);
  return q;
};

const findById = (id) => supabase.from('loans').select(SELECT).eq('id', id).maybeSingle();

const create = (row) => supabase.from('loans').insert(row).select(SELECT).single();

const update = (id, changes) =>
  supabase.from('loans').update(changes).eq('id', id).select(SELECT).maybeSingle();

const remove = (id) => supabase.from('loans').delete().eq('id', id).select().maybeSingle();

module.exports = { today, markLate, findAll, findById, create, update, remove };
