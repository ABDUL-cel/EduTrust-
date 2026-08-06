const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  term: { type: String, required: true },
  session: { type: String, required: true },
  
  // Dynamic breakdown matching assessment schema
  breakdown: [{
    assessment_name: String,
    score_obtained: Number,
    max_score: Number
  }],
  
  total: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  remark: { type: String, default: '' }
}, { timestamps: true });

// Calculate total score prior to save
ScoreSchema.pre('save', function(next) {
  if (this.breakdown && this.breakdown.length > 0) {
    this.total = this.breakdown.reduce((acc, curr) => acc + (curr.score_obtained || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Score', ScoreSchema);

