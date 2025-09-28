'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { Download, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Resume {
  _id: string;
  originalName: string;
  status: string;
  score?: number;
  reviewNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
}

interface ResumeListProps {
  onRefresh?: () => void;
  onDownload?: (resumeId: string, originalName: string) => void;
}

export default function ResumeList({ onRefresh, onDownload }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/my-resumes');
      setResumes(response.data);
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'needs_revision':
        return 'status-needs-revision';
      case 'rejected':
        return 'status-rejected';
      case 'under_review':
        return 'status-under-review';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No resumes uploaded yet
        </h3>
        <p className="text-gray-600">
          Upload your first resume to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <div key={resume._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-medium text-gray-900">
                  {resume.originalName}
                </h3>
                <span className={getStatusColor(resume.status)}>
                  {getStatusText(resume.status)}
                </span>
                {resume.score && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Score: {resume.score}/100
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Uploaded: {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                </p>
                {resume.reviewedAt && (
                  <p>
                    Reviewed: {format(new Date(resume.reviewedAt), 'MMM dd, yyyy')}
                  </p>
                )}
                {resume.reviewNotes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                    <strong>Review Notes:</strong> {resume.reviewNotes}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 flex space-x-2">
              <button
                onClick={() => onDownload?.(resume._id, resume.originalName)}
                className="btn-secondary text-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
