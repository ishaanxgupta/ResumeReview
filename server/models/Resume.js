const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'needs_revision', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String
  }]
});

// Indexes for better performance
resumeSchema.index({ userId: 1 });
resumeSchema.index({ status: 1 });
resumeSchema.index({ reviewerId: 1 });
resumeSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
