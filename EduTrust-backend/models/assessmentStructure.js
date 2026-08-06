const mongoose = require('mongoose');

const AssessmentStructureSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  assessment_name: { type: String, required: true }, // e.g., "Assignment", "Test", "Exam"
  percentage: { type: Number, required: true }, // e.g., 10, 20, 60
  term: { type: String, enum: ['1st Term', '2nd Term', '3rd Term'], required: true },
  session: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AssessmentStructure', AssessmentStructureSchema);

