import React from 'react';
import { WorkExperienceInput } from '../../api/types';
import styles from './CandidateForm.module.css';

interface WorkExperienceFieldsetProps {
  index: number;
  value: WorkExperienceInput;
  onChange: (index: number, updated: WorkExperienceInput) => void;
  onRemove: (index: number) => void;
}

function WorkExperienceFieldset({ index, value, onChange, onRemove }: WorkExperienceFieldsetProps) {
  function handleChange(field: keyof WorkExperienceInput, inputValue: string) {
    onChange(index, { ...value, [field]: inputValue });
  }

  return (
    <fieldset className={styles.rowFieldset}>
      <legend className={styles.srOnly}>Work experience entry {index + 1}</legend>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`work-company-${index}`}>Company</label>
          <input
            id={`work-company-${index}`}
            type="text"
            value={value.company ?? ''}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`work-title-${index}`}>Job title</label>
          <input
            id={`work-title-${index}`}
            type="text"
            value={value.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`work-startDate-${index}`}>Start date</label>
          <input
            id={`work-startDate-${index}`}
            type="date"
            value={value.startDate ?? ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`work-endDate-${index}`}>End date</label>
          <input
            id={`work-endDate-${index}`}
            type="date"
            value={value.endDate ?? ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`work-description-${index}`}>Description</label>
        <textarea
          id={`work-description-${index}`}
          rows={3}
          value={value.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(index)}
      >
        Remove
      </button>
    </fieldset>
  );
}

export default WorkExperienceFieldset;
