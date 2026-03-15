import React from 'react';
import CandidateForm from '../components/CandidateForm/CandidateForm';
import styles from './AddCandidatePage.module.css';

function AddCandidatePage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Add Candidate</h1>
        <p className={styles.subtitle}>Fill in the form below to add a new candidate to the system.</p>
      </header>
      <CandidateForm />
    </main>
  );
}

export default AddCandidatePage;
