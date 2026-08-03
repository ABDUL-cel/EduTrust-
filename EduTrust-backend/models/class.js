const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  class_name: { type: String, required: true }, // e.g., "JSS1", "Primary 5"
  arm: { type: String, required: true }, // e.g., "A", "Science"
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure uniqueness of class + arm per school
ClassSchema.index({ school_id: 1, class_name: 1, arm: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);

