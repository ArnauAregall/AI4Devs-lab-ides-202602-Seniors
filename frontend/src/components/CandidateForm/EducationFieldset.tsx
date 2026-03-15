import React from 'react';
import { EducationInput } from '../../api/types';
import styles from './CandidateForm.module.css';

interface EducationFieldsetProps {
  index: number;
  value: EducationInput;
  onChange: (index: number, updated: EducationInput) => void;
  onRemove: (index: number) => void;
}

function EducationFieldset({ index, value, onChange, onRemove }: EducationFieldsetProps) {
  function handleChange(field: keyof EducationInput, inputValue: string) {
    onChange(index, { ...value, [field]: inputValue });
  }

  return (
    <fieldset className={styles.rowFieldset}>
      <legend className={styles.srOnly}>Education entry {index + 1}</legend>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`edu-degree-${index}`}>Degree</label>
          <input
            id={`edu-degree-${index}`}
            type="text"
            value={value.degree ?? ''}
            onChange={(e) => handleChange('degree', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`edu-institution-${index}`}>Institution</label>
          <input
            id={`edu-institution-${index}`}
            type="text"
            value={value.institution ?? ''}
            onChange={(e) => handleChange('institution', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`edu-startDate-${index}`}>Start date</label>
          <input
            id={`edu-startDate-${index}`}
            type="date"
            value={value.startDate ?? ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`edu-endDate-${index}`}>End date</label>
          <input
            id={`edu-endDate-${index}`}
            type="date"
            value={value.endDate ?? ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
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

export default EducationFieldset;
