const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  admission_number: { type: String, required: true, unique: true },
  full_name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  date_of_birth: { type: Date },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  parent_name: { type: String, required: true },
  parent_phone: { type: String, required: true },
  parent_email: { type: String, lowercase: true, trim: true },
  address: { type: String },
  passport: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Graduated', 'Suspended', 'Transferred'], default: 'Active' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Student', StudentSchema);

