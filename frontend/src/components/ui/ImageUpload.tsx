'use client';

import React, { useState, useCallback } from 'react';

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
  preview?: boolean;
}

export default function ImageUpload({
  onFilesSelected,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  label = 'Upload Images',
  preview = true,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).slice(0, maxFiles);
    onFilesSelected(validFiles);

    if (preview) {
      const urls = validFiles.map(f => URL.createObjectURL(f));
      setPreviews(urls);
    }
  }, [maxFiles, onFilesSelected, preview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="image-upload-wrapper">
      <label className="image-upload-label">{label}</label>
      <div
        className={`image-upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="upload-icon">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="upload-text">Drag & drop images here, or <span className="upload-link">browse</span></p>
        <p className="upload-hint">Max {maxFiles} files · JPEG, PNG, WebP, GIF</p>
        <input
          id="image-upload-input"
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </div>

      {previews.length > 0 && (
        <div className="image-upload-previews">
          {previews.map((src, i) => (
            <div key={i} className="upload-preview-item">
              <img src={src} alt={`Preview ${i + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
