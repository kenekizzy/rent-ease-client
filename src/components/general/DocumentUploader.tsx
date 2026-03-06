'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useDocumentStore } from '@/stores/document.store';
import { DocumentAccessLevel } from '@/types';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const MAX_MB = 10;

interface Props {
  leaseId?: string;
  propertyId?: string;
  /** Called after a successful upload with the new document record */
  onSuccess?: (docId: string) => void;
}

export default function DocumentUploader({ leaseId, propertyId, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accessLevel, setAccessLevel] = useState<DocumentAccessLevel>('both');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { upload, uploading, uploadProgress, error, clearError } = useDocumentStore();

  // ---- File validation ----
  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported type: ${file.type}. Use PDF, image, text, or Excel.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File is too large. Max size is ${MAX_MB} MB.`;
    }
    return null;
  }

  function handleFileSelect(file: File) {
    clearError();
    const err = validate(file);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setSelectedFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const doc = await upload({ file: selectedFile, leaseId, propertyId, accessLevel });
    if (doc) {
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onSuccess?.(doc.id);
    }
  }

  const displayError = validationError ?? error;

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10',
          'cursor-pointer transition-colors duration-150 select-none',
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900',
        ].join(' ')}
      >
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedFile ? selectedFile.name : 'Click or drag & drop a file'}
        </p>
        <p className="text-xs text-gray-400">PDF, image, text, Excel · max {MAX_MB} MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={onInputChange}
        />
      </div>

      {/* Access level selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Visible to
        </label>
        <select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value as DocumentAccessLevel)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                     dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="both">Both landlord & tenant</option>
          <option value="landlord">Landlord only</option>
          <option value="tenant">Tenant only</option>
        </select>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {displayError}
        </p>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={[
          'w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150',
          selectedFile && !uploading
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
        ].join(' ')}
      >
        {uploading ? 'Uploading…' : 'Upload Document'}
      </button>
    </div>
  );
}