const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: { 
    type: String, 
    enum: ['All', 'Staff', 'Parents', 'Students'], 
    default: 'All' 
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);

