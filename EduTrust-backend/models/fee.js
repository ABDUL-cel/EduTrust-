const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  fee_name: { type: String, required: true }, // e.g., "School Fee", "PTA", "Uniform"
  amount: { type: Number, required: true },
  session: { type: String, required: true },
  term: { type: String, enum: ['1st Term', '2nd Term', '3rd Term'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Fee', FeeSchema);

