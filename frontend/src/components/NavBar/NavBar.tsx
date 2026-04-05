import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

function NavBar() {
  return (
    <nav aria-label="Main navigation" className={styles.nav}>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
      >
        Home
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
      >
        Profile
      </NavLink>
      <NavLink
        to="/candidates"
        className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
      >
        Candidates
      </NavLink>
    </nav>
  );
}

export default NavBar;
