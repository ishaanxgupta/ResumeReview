'use client';

import { useState, useRef,useEffect } from 'react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { X, FileText, User, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';

interface Resume {
  _id: string;
  originalName: string;
  status: string;
  score?: number;
  reviewNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  reviewerId?: {
    _id: string;
    name: string;
  };
  tags: string[];
}

interface ResumeReviewModalProps {
  resume: Resume;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ResumeReviewModal({ resume, onClose, onUpdate }: ResumeReviewModalProps) {
  const [status, setStatus] = useState(resume.status);
  const [score, setScore] = useState(resume.score || '');
  const [reviewNotes, setReviewNotes] = useState(resume.reviewNotes || '');
  const [tags, setTags] = useState(resume.tags.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await api.get(`/resumes/${resume._id}/download`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    };

    loadPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resume._id, pdfUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const updateData = {
        status,
        score: score ? parseInt(score.toString()) : undefined,
        reviewNotes: reviewNotes.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      await api.put(`/resumes/${resume._id}/review`, updateData);
      
      toast.success('Resume review updated successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resumes/${resume._id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Review Resume
              </h2>
              <p className="text-sm text-gray-600">{resume.originalName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Applicant Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{resume.userId.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{resume.userId.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Uploaded</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(resume.uploadedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {resume.reviewerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Reviewed By</label>
                  <p className="text-sm text-gray-900">{resume.reviewerId.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resume Preview</h3>
              <button
                onClick={handleDownload}
                className="btn-secondary text-sm flex items-center"
              >
                <FileText className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="flex justify-center">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-96 border border-gray-300 rounded"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="w-full h-96 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading PDF preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="needs_revision">Needs Revision</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-100)
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max="100"
                    className="input-field pl-10"
                    placeholder="Enter score"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field"
                placeholder="e.g., experienced, technical, entry-level"
              />
            </div>

            <div>
              <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes
              </label>
              <textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Add detailed feedback and notes for the applicant..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
