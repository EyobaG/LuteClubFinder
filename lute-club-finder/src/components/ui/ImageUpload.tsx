import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface ImageUploadProps {
  label?: string;
  currentUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function ImageUpload({
  label,
  currentUrl,
  onUpload,
  onRemove,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be under ${maxSizeMB}MB`);
      return;
    }

    // Validate type
    if (!accept.split(',').some((type) => file.type === type.trim())) {
      setError('Invalid file type. Please upload PNG, JPEG, or WebP.');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setUploading(true);
    setProgress(30); // Simulate progress start
    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);

      const url = await onUpload(file);
      clearInterval(progressInterval);
      setProgress(100);
      setPreview(url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      setProgress(0);
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    }
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-40 object-cover rounded-lg border border-gray-200"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-white/20 rounded-lg hover:bg-white/30 backdrop-blur-sm"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600/80 rounded-lg hover:bg-red-700 backdrop-blur-sm"
              >
                Remove
              </button>
            )}
          </div>
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50"
        >
          <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </span>
          <span className="text-xs mt-1">PNG, JPEG, WebP up to {maxSizeMB}MB</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
