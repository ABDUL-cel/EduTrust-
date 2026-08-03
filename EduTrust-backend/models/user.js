const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Principal', 'Vice Principal', 'Bursar', 'Teacher', 'Accountant', 'Secretary'],
    required: true 
  },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  last_login: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', UserSchema);

