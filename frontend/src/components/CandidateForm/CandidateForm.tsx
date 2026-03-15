import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../../api/candidatesApi';
import { ApiError, EducationInput, WorkExperienceInput } from '../../api/types';
import { validateCandidateForm } from '../../validation/candidateValidation';
import EducationFieldset from './EducationFieldset';
import WorkExperienceFieldset from './WorkExperienceFieldset';
import CvUploadField from './CvUploadField';
import styles from './CandidateForm.module.css';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  notes: string;
  education: EducationInput[];
  workExperience: WorkExperienceInput[];
  cvFile: File | null;
}

const emptyForm = (): FormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  source: '',
  notes: '',
  education: [],
  workExperience: [],
  cvFile: null,
});

function CandidateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function addEducation() {
    setForm((prev) => ({ ...prev, education: [...prev.education, {}] }));
  }

  function updateEducation(index: number, updated: EducationInput) {
    setForm((prev) => {
      const education = [...prev.education];
      education[index] = updated;
      return { ...prev, education };
    });
  }

  function removeEducation(index: number) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function addWorkExperience() {
    setForm((prev) => ({ ...prev, workExperience: [...prev.workExperience, {}] }));
  }

  function updateWorkExperience(index: number, updated: WorkExperienceInput) {
    setForm((prev) => {
      const workExperience = [...prev.workExperience];
      workExperience[index] = updated;
      return { ...prev, workExperience };
    });
  }

  function removeWorkExperience(index: number) {
    setForm((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const errors = validateCandidateForm({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      cvFile: form.cvFile,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const candidate = await createCandidate({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        source: form.source || undefined,
        notes: form.notes || undefined,
        education: form.education.length > 0 ? form.education : undefined,
        workExperience: form.workExperience.length > 0 ? form.workExperience : undefined,
        cvFile: form.cvFile ?? undefined,
      });
      setSuccessName(`${candidate.firstName} ${candidate.lastName}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        } else if (err.status === 409) {
          setGlobalError('A candidate with this email address already exists.');
        } else if (err.status === 413) {
          setFieldErrors({ cvFile: 'The CV file is too large. Please upload a file under 5 MB.' });
        } else {
          setGlobalError('An unexpected error occurred. Please try again later.');
        }
      } else {
        setGlobalError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (successName) {
    return (
      <div className={styles.successContainer}>
        <p role="status" className={styles.successMessage}>
          Candidate <strong>{successName}</strong> was added successfully.
        </p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setSuccessName(null);
            setForm(emptyForm());
          }}
        >
          Add another
        </button>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => navigate('/')}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div role="alert" className={styles.globalError}>
          {globalError}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Candidate Details</h2>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="firstName">First name <span aria-hidden="true">*</span></label>
            <input
              id="firstName"
              type="text"
              required
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
            />
            {fieldErrors.firstName && (
              <p id="firstName-error" className={styles.fieldError} role="alert">
                {fieldErrors.firstName}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName">Last name <span aria-hidden="true">*</span></label>
            <input
              id="lastName"
              type="text"
              required
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
            />
            {fieldErrors.lastName && (
              <p id="lastName-error" className={styles.fieldError} role="alert">
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className={styles.fieldError} role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education History</h2>

        {form.education.map((edu, i) => (
          <EducationFieldset
            key={i}
            index={i}
            value={edu}
            onChange={updateEducation}
            onRemove={removeEducation}
          />
        ))}

        <button type="button" className={styles.addButton} onClick={addEducation}>
          Add education
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Work Experience</h2>

        {form.workExperience.map((job, i) => (
          <WorkExperienceFieldset
            key={i}
            index={i}
            value={job}
            onChange={updateWorkExperience}
            onRemove={removeWorkExperience}
          />
        ))}

        <button type="button" className={styles.addButton} onClick={addWorkExperience}>
          Add job
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Additional Details</h2>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="source">Source</label>
            <input
              id="source"
              type="text"
              value={form.source}
              onChange={(e) => updateField('source', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>CV Upload</h2>
        <CvUploadField
          file={form.cvFile}
          error={fieldErrors.cvFile}
          onChange={(file) => updateField('cvFile', file)}
        />
      </section>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Saving…' : 'Add Candidate'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate('/')}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CandidateForm;
