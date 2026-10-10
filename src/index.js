require('dotenv').config();
const express = require('express');
const loanRoutes = require('./routes/loanRoutes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Peminjaman Buku berjalan', endpoints: '/loans' });
});

app.use('/loans', loanRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));

// Hanya listen saat dijalankan lokal (node src/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

// Diekspor agar Vercel bisa memakainya sebagai serverless function
module.exports = app;
