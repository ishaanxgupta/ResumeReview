'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, X, Eye } from 'lucide-react';

interface ResumeUploadProps {
  onUploadSuccess: () => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreviewFile(file);
      
      // Create a data URL for PDF preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const uploadResume = async () => {
    if (!previewFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', previewFile);

      await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume uploaded successfully!');
      setPreviewFile(null);
      setPreviewUrl(null);
      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };


  // Cleanup data URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border-gray-600 ${
          isDragActive
            ? 'border-blue-400 bg-gray-700/50 scale-105'
            : 'hover:border-blue-400 hover:bg-gray-700/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-xl font-semibold text-white mb-3">
          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
        </p>
        <p className="text-gray-400 mb-4 text-lg">or click to browse files</p>
        <p className="text-sm text-gray-500">
          Only PDF files up to 10MB are accepted
        </p>
      </div>

      {/* Preview Area */}
      {previewFile && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{previewFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removePreview}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* PDF Preview */}
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center text-lg">
                <Eye className="w-5 h-5 mr-3 text-blue-400" />
                PDF Preview
              </h3>
              <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600">
                PDF Document
              </span>
            </div>
            
            <div className="flex justify-center bg-white rounded border">
              {previewUrl ? (
                <div className="pdf-preview-container w-full max-w-md">
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 border-0 rounded"
                    title="PDF Preview"
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      PDF preview - scroll to view all pages
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={removePreview}
              className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={uploadResume}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center font-semibold"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Uploading...
                </>
              ) : (
                'Upload Resume'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
