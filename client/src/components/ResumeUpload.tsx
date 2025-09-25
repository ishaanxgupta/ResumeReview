'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, X, Eye } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface ResumeUploadProps {
  onUploadSuccess: () => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreviewFile(file);
      setNumPages(null);
      
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
    setNumPages(null);
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
      setNumPages(null);
      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
        </p>
        <p className="text-gray-500 mb-4">or click to browse files</p>
        <p className="text-sm text-gray-400">
          Only PDF files up to 10MB are accepted
        </p>
      </div>

      {/* Preview Area */}
      {previewFile && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">{previewFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removePreview}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PDF Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                PDF Preview
              </h3>
              {numPages && (
                <span className="text-sm text-gray-500">
                  {numPages} page{numPages !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex justify-center bg-white rounded border">
              {previewUrl ? (
                <div className="pdf-preview-container">
                  <Document
                    file={previewUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center p-8 text-red-600">
                        <p>Failed to load PDF preview</p>
                      </div>
                    }
                    options={{
                      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                      cMapPacked: true,
                      standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                    }}
                  >
                    <Page
                      pageNumber={1}
                      width={300}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      canvasBackground="white"
                    />
                  </Document>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={removePreview}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={uploadResume}
              disabled={uploading}
              className="btn-primary flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
