'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import ResumeUpload from '@/components/ResumeUpload';
import ResumeList from '@/components/ResumeList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LogOut, Upload, FileText } from 'lucide-react';
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'resumes'>('upload');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    fetchResumes();
  }, [user, router]);

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

  const handleUploadSuccess = () => {
    fetchResumes();
    setActiveTab('resumes');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name}
              </h1>
              <p className="text-gray-600">Resume Review Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{resumes.length}</div>
            <div className="text-sm text-gray-600">Total Resumes</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {resumes.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">
              {resumes.filter(r => r.status === 'needs_revision').length}
            </div>
            <div className="text-sm text-gray-600">Needs Revision</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {resumes.filter(r => r.status === 'under_review' || r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Resume
              </button>
              <button
                onClick={() => setActiveTab('resumes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resumes'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                My Resumes ({resumes.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload New Resume
                </h2>
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            )}

            {activeTab === 'resumes' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  My Resumes
                </h2>
                {resumes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No resumes uploaded yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload your first resume to get started
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="btn-primary"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes.map((resume) => (
                      <div key={resume._id} className="border border-gray-200 rounded-lg p-4">
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
                                <p className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                                  <strong>Review Notes:</strong> {resume.reviewNotes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <a
                              href={`/api/resumes/${resume._id}/download`}
                              className="btn-secondary text-sm"
                              download
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
