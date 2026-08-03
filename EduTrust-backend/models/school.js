const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  school_name: { type: String, required: true, trim: true },
  school_email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  school_type: { 
    type: String, 
    enum: ['Primary', 'Secondary', 'Tertiary', 'Combined'], 
    default: 'Secondary' 
  },
  academic_session: { type: String, required: true }, // e.g., "2025/2026"
  current_term: { type: String, enum: ['1st Term', '2nd Term', '3rd Term'], required: true },
  school_motto: { type: String, default: '' },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  principal: { type: String, default: '' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('School', SchoolSchema);

