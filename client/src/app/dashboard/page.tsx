'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import ResumeUpload from '@/components/ResumeUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LogOut, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import LogoutBtn from '@/utils/LogoutBtn';

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    fetchResumes();
  }, [user, router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleUploadSuccess = () => {
    fetchResumes();
    setActiveTab('resumes');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDownload = async (resumeId: string, originalName: string) => {
    try {
      const response = await api.get(`/resumes/${resumeId}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download resume');
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Sticky Header */}
      <header
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-50
    ${isScrolled 
      ? "top-2 left-1/2 -translate-x-1/2 w-[95%] sm:w-[85%] max-w-5xl bg-black/30 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl" 
      : "w-full bg-black/90 backdrop-blur-sm border-b border-gray-700 shadow-lg rounded-none"
    }`}
>
  <div
    className={`px-4 sm:px-6 lg:px-8 transition-all duration-500 
      ${isScrolled ? "py-2" : "py-6"}`}
  >
    <div className="flex justify-between items-center transition-all duration-500">
      
      {/* Left Side */}
      <div>
        <h1
          className={`font-bold text-white transition-all duration-500 
            ${isScrolled ? "text-xl" : "text-4xl"}`}
        >
          {isScrolled ? user?.name : `Welcome, ${user?.name}`}
        </h1>
        {!isScrolled && (
          <p className="text-gray-400 mt-2 text-lg transition-all duration-500">
            Resume Review Dashboard
          </p>
        )}
      </div>

      {/* Right Side */}
      {/* <button
        onClick={handleLogout}
        className={`flex items-center space-x-2 text-white bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-lg 
          ${isScrolled ? "px-4 py-2 rounded-lg text-sm" : "px-6 py-3 rounded-xl"}`}
      >
        <LogOut className={`${isScrolled ? "w-4 h-4" : "w-5 h-5"}`} />
        <span>Logout</span>
      </button> */}
      <button onClick={handleLogout}>
      <LogoutBtn />
      </button>
    </div>
  </div>
</header>



      {/* Main Content with top padding to account for fixed header */}
      <div className={`transition-all duration-500 ${isScrolled ? 'pt-20' : 'pt-28'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="text-4xl font-bold text-white">{resumes.length}</div>
            <div className="text-gray-300 mt-2 font-medium">Total Resumes</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="text-4xl font-bold text-green-400">
              {resumes.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-gray-300 mt-2 font-medium">Approved</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="text-4xl font-bold text-yellow-400">
              {resumes.filter(r => r.status === 'needs_revision').length}
            </div>
            <div className="text-gray-300 mt-2 font-medium">Needs Revision</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="text-4xl font-bold text-blue-400">
              {resumes.filter(r => r.status === 'under_review' || r.status === 'pending').length}
            </div>
            <div className="text-gray-300 mt-2 font-medium">Under Review</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6 py-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'upload'
                    ? 'border-blue-400 text-blue-400 bg-blue-600/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <Upload className="w-5 h-5 inline mr-3" />
                Upload Resume
              </button>
              <button
                onClick={() => setActiveTab('resumes')}
                className={`py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'resumes'
                    ? 'border-blue-400 text-blue-400 bg-blue-600/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-3" />
                My Resumes ({resumes.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8">
                  Upload New Resume
                </h2>
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            )}

            {activeTab === 'resumes' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8">
                  My Resumes
                </h2>
                {resumes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      No resumes uploaded yet
                    </h3>
                    <p className="text-gray-400 mb-6 text-lg">
                      Upload your first resume to get started
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-300 font-semibold"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumes.map((resume) => (
                      <div key={resume._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <h3 className="font-bold text-white text-xl">
                                {resume.originalName}
                              </h3>
                              <span className={getStatusColor(resume.status)}>
                                {getStatusText(resume.status)}
                              </span>
                              {resume.score && (
                                <span className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-full text-sm font-semibold border border-gray-600">
                                  Score: {resume.score}/100
                                </span>
                              )}
                            </div>
                            <div className="text-gray-300 space-y-3">
                              <p className="flex items-center">
                                <span className="text-blue-400 font-medium mr-2">📅 Uploaded:</span> 
                                {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                              </p>
                              {resume.reviewedAt && (
                                <p className="flex items-center">
                                  <span className="text-blue-400 font-medium mr-2">✅ Reviewed:</span> 
                                  {format(new Date(resume.reviewedAt), 'MMM dd, yyyy')}
                                </p>
                              )}
                              {resume.reviewNotes && (
                                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                                  <p className="text-blue-400 font-semibold mb-2">📝 Review Notes:</p>
                                  <p className="text-gray-300 leading-relaxed">{resume.reviewNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-6">
                            <button
                              onClick={() => handleDownload(resume._id, resume.originalName)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 font-semibold"
                            >
                              Download
                            </button>
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
    </div>
  );
}
