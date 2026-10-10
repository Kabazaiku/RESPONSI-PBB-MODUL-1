const express = require('express');
const loan = require('../controllers/loanController');

const router = express.Router();

router.get('/', loan.getLoans);
router.get('/:id', loan.getLoanById);
router.post('/', loan.createLoan);
router.put('/:id', loan.updateLoan);
router.delete('/:id', loan.deleteLoan);

module.exports = router;
