const Loan = require('../models/loanModel');

const STATUSES = ['Dipinjam', 'Dikembalikan', 'Terlambat'];
const UPDATABLE = ['member_id', 'book_id', 'loan_date', 'due_date', 'return_date', 'status'];
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));

// GET /loans?status=Terlambat&member_id=1&book_id=2
const getLoans = async (req, res) => {
  const { status } = req.query;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status harus salah satu dari: ${STATUSES.join(', ')}` });
  }
  await Loan.markLate();

  const { data, error } = await Loan.findAll(req.query);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, data });
};

// GET /loans/:id
const getLoanById = async (req, res) => {
  await Loan.markLate();
  const { data, error } = await Loan.findById(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
  res.json({ data });
};

// POST /loans
const createLoan = async (req, res) => {
  const { member_id, book_id, loan_date, due_date } = req.body;
  if (!member_id || !book_id || !due_date) {
    return res.status(400).json({ error: 'member_id, book_id, dan due_date wajib diisi' });
  }
  if (!isDate(due_date) || (loan_date && !isDate(loan_date))) {
    return res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD' });
  }
  const row = { member_id, book_id, due_date, status: 'Dipinjam' };
  if (loan_date) row.loan_date = loan_date;

  const { data, error } = await Loan.create(row);
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Peminjaman berhasil dibuat', data });
};

// PUT /loans/:id
const updateLoan = async (req, res) => {
  const changes = {};
  for (const k of UPDATABLE) if (req.body[k] !== undefined) changes[k] = req.body[k];

  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: `Kirim minimal satu field: ${UPDATABLE.join(', ')}` });
  }
  if (changes.status && !STATUSES.includes(changes.status)) {
    return res.status(400).json({ error: `status harus salah satu dari: ${STATUSES.join(', ')}` });
  }
  for (const k of ['loan_date', 'due_date', 'return_date']) {
    if (changes[k] && !isDate(changes[k])) {
      return res.status(400).json({ error: `${k} harus berformat YYYY-MM-DD` });
    }
  }
  // Buku dikembalikan -> isi tanggal kembali otomatis
  if (changes.status === 'Dikembalikan' && !changes.return_date) changes.return_date = Loan.today();

  const { data, error } = await Loan.update(req.params.id, changes);
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
  res.json({ message: 'Peminjaman berhasil diperbarui', data });
};

// DELETE /loans/:id
const deleteLoan = async (req, res) => {
  const { data, error } = await Loan.remove(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
  res.json({ message: 'Peminjaman berhasil dihapus' });
};

module.exports = { getLoans, getLoanById, createLoan, updateLoan, deleteLoan };
