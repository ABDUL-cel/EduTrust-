const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  installment_number: { type: Number, required: true },
  amount: { type: Number, required: true },
  balance_after_payment: { type: Number, required: true },
  received_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: 'payment_date', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Installment', InstallmentSchema);

