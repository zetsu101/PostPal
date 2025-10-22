'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface FileUploaderProps {
  onUpload?: (files: File[]) => void;
  onUploadComplete?: (results: UploadResult[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  userId: string;
  folder?: string;
}

interface UploadResult {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  result?: UploadResult;
}

export default function FileUploader({
  onUpload,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 50,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  className = '',
  userId,
  folder = 'uploads',
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.file;
  }, [userId, folder]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Limit number of files
    const filesToUpload = acceptedFiles.slice(0, maxFiles);
    
    // Initialize uploading files
    const initialUploadingFiles: UploadingFile[] = filesToUpload.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadingFiles(prev => [...prev, ...initialUploadingFiles]);

    // Upload files
    const uploadPromises = filesToUpload.map(async (file, index) => {
      try {
        const result = await uploadFile(file);
        
        setUploadingFiles(prev => 
          prev.map((uploadingFile, i) => 
            i === prev.length - filesToUpload.length + index
              ? { ...uploadingFile, status: 'completed', progress: 100, result }
              : uploadingFile
          )
        );

        return result;
      } catch (error) {
        setUploadingFiles(prev => 
          prev.map((uploadingFile, i) => 
            i === prev.length - filesToUpload.length + index
              ? { 
                  ...uploadingFile, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : uploadingFile
          )
        );
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result): result is UploadResult => result !== null);

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(file => file.status !== 'completed'));
    }, 3000);

  }, [uploadFile, maxFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎥';
    if (contentType === 'application/pdf') return '📄';
    return '📁';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : isDragReject 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl">
            {isDragActive ? '📁' : '☁️'}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse files
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Max {maxFiles} files, {maxSize}MB each</p>
            <p>Supported: Images, Videos, PDFs</p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploading Files</h3>
          
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {/* File Icon */}
                <div className="text-2xl">
                  {getFileIcon(uploadingFile.file.type)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                </div>
                
                {/* Status */}
                <div className="text-sm">
                  {uploadingFile.status === 'uploading' && (
                    <span className="text-blue-600">Uploading...</span>
                  )}
                  {uploadingFile.status === 'completed' && (
                    <span className="text-green-600">✓ Complete</span>
                  )}
                  {uploadingFile.status === 'error' && (
                    <span className="text-red-600">✗ Error</span>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {uploadingFile.status === 'uploading' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {uploadingFile.status === 'error' && uploadingFile.error && (
                <p className="mt-2 text-xs text-red-600">
                  {uploadingFile.error}
                </p>
              )}
              
              {/* Preview for completed images */}
              {uploadingFile.status === 'completed' && 
               uploadingFile.result?.thumbnailUrl && 
               uploadingFile.file.type.startsWith('image/') && (
                <div className="mt-3">
                  <Image
                    src={uploadingFile.result.thumbnailUrl}
                    alt={uploadingFile.file.name}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
