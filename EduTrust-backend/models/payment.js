const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  total_fee_amount: { type: Number, required: true },
  amount_paid: { type: Number, required: true, default: 0 },
  balance: { type: Number, required: true },
  payment_method: { 
    type: String, 
    enum: ['Cash', 'Bank Transfer', 'Card', 'POS', 'Cheque'], 
    required: true 
  },
  payment_reference: { type: String, unique: true, required: true },
  receipt_number: { type: String, unique: true, required: true },
  received_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  payer_name: { type: String, required: true },
  payer_address: { type: String },
  payer_signature: { type: String, default: '' },
  
  status: { 
    type: String, 
    enum: ['Full Payment', 'Partial Payment', 'Pending'], 
    default: 'Pending' 
  }
}, { timestamps: { createdAt: 'payment_date', updatedAt: 'updated_at' } });

// Auto-update status based on balance before saving
PaymentSchema.pre('save', function(next) {
  this.balance = this.total_fee_amount - this.amount_paid;
  if (this.balance <= 0) {
    this.status = 'Full Payment';
    this.balance = 0;
  } else if (this.amount_paid > 0) {
    this.status = 'Partial Payment';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);

