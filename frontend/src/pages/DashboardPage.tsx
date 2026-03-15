import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recruiter Dashboard</h1>
        <p className={styles.subtitle}>Manage candidates and track your hiring pipeline.</p>
      </header>

      <section className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={() => navigate('/candidates/new')}
        >
          Add Candidate
        </button>
      </section>
    </main>
  );
}

export default DashboardPage;
