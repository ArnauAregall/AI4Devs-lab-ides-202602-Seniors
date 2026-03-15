import React from 'react';
import styles from './CandidateForm.module.css';

interface CvUploadFieldProps {
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CvUploadField({ file, error, onChange }: CvUploadFieldProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    onChange(selected);
  }

  return (
    <div className={styles.field}>
      <label htmlFor="cvFile">
        CV / Resume
        <span className={styles.hint}> (PDF or DOCX, max 5 MB)</span>
      </label>
      <input
        id="cvFile"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
      />
      {file && (
        <p className={styles.filePreview}>
          {file.name} — {formatBytes(file.size)}
        </p>
      )}
      {error && (
        <p id="cvFile-error" className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default CvUploadField;
