'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import FileUploader from './FileUploader';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    optimized?: boolean;
  };
}

interface MediaDashboardProps {
  userId: string;
  onFileSelect?: (file: MediaFile) => void;
  selectedFiles?: string[];
  multiSelect?: boolean;
}

export default function MediaDashboard({
  userId,
  onFileSelect,
  selectedFiles = [],
  multiSelect = false,
}: MediaDashboardProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/upload?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  // Handle file upload completion
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

  // Filter files based on type and search term
  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'all' || 
      (filter === 'images' && file.contentType.startsWith('image/')) ||
      (filter === 'videos' && file.contentType.startsWith('video/')) ||
      (filter === 'documents' && file.contentType === 'application/pdf');
    
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎥';
    if (contentType === 'application/pdf') return '📄';
    return '📁';
  };

  const isSelected = (fileId: string): boolean => {
    return selectedFiles.includes(fileId);
  };

  const handleFileClick = (file: MediaFile) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Media Library</h2>
        <div className="text-sm text-gray-500">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <FileUploader
          userId={userId}
          onUploadComplete={handleUploadComplete}
          folder="media"
          maxFiles={5}
          maxSize={50}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Files' },
            { key: 'images', label: 'Images' },
            { key: 'videos', label: 'Videos' },
            { key: 'documents', label: 'Documents' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Upload your first file to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`
                relative group bg-white border rounded-lg overflow-hidden cursor-pointer transition-all
                ${isSelected(file.id) 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleFileClick(file)}
            >
              {/* File Preview */}
              <div className="aspect-square relative">
                {file.contentType.startsWith('image/') && file.thumbnailUrl ? (
                  <Image
                    src={file.thumbnailUrl}
                    alt={file.filename}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-3xl">{getFileIcon(file.contentType)}</span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected(file.id) && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="absolute top-2 left-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>

              {/* File Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
