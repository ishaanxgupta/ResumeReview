const express = require('express');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendStatusNotification } = require('../services/emailService');

const router = express.Router();

// Upload resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resume = new Resume({
      userId: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending'
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        status: resume.status,
        uploadedAt: resume.uploadedAt
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// Get user's resumes
router.get('/my-resumes', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('-filePath');

    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
});

// Get all resumes (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      // Search by user name or original file name
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.userId = { $in: users.map(u => u._id) };
    }

    const resumes = await Resume.find(query)
      .populate('userId', 'name email')
      .populate('reviewerId', 'name')
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath');

    const total = await Resume.countDocuments(query);

    res.json({
      resumes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
});

// Get single resume (admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reviewerId', 'name');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
});

// Download resume file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check if user owns the resume or is admin
    if (resume.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../uploads', resume.fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, resume.originalName);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Error downloading resume' });
  }
});

// Update resume status and score (admin only)
router.put('/:id/review', adminAuth, async (req, res) => {
  try {
    const { status, score, reviewNotes, tags } = req.body;

    if (!status || !['pending', 'under_review', 'approved', 'needs_revision', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const resume = await Resume.findById(req.params.id).populate('userId', 'name email');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const oldStatus = resume.status;

    resume.status = status;
    resume.reviewerId = req.user._id;
    resume.reviewedAt = new Date();

    if (score !== undefined) {
      resume.score = score;
    }

    if (reviewNotes !== undefined) {
      resume.reviewNotes = reviewNotes;
    }

    if (tags !== undefined) {
      resume.tags = tags;
    }

    await resume.save();

    // Send notification email if status changed
    if (oldStatus !== status) {
      try {
        await sendStatusNotification(
          resume.userId.email,
          resume.userId.name,
          status,
          reviewNotes
        );
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      message: 'Resume review updated successfully',
      resume: {
        id: resume._id,
        status: resume.status,
        score: resume.score,
        reviewNotes: resume.reviewNotes,
        tags: resume.tags,
        reviewedAt: resume.reviewedAt
      }
    });
  } catch (error) {
    console.error('Update resume review error:', error);
    res.status(500).json({ message: 'Error updating resume review' });
  }
});

// Delete resume (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', resume.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
});

module.exports = router;
