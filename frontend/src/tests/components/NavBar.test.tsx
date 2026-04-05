import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';

function renderNavBar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<NavBar />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NavBar', () => {
  it('renders all three navigation links', () => {
    renderNavBar();

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Candidates' })).toBeInTheDocument();
  });

  it('wraps links in a <nav> with aria-label="Main navigation"', () => {
    renderNavBar();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('is not rendered on the login page when excluded from layout', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="*" element={<NavBar />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('applies the active class to the Home link when on the "/" route', () => {
    renderNavBar('/');

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink.className).toMatch(/active/);

    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink.className).not.toMatch(/active/);

    const candidatesLink = screen.getByRole('link', { name: 'Candidates' });
    expect(candidatesLink.className).not.toMatch(/active/);
  });

  it('applies the active class to the Profile link when on the "/profile" route', () => {
    renderNavBar('/profile');

    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink.className).toMatch(/active/);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink.className).not.toMatch(/active/);
  });

  it('applies the active class to the Candidates link when on the "/candidates" route', () => {
    renderNavBar('/candidates');

    const candidatesLink = screen.getByRole('link', { name: 'Candidates' });
    expect(candidatesLink.className).toMatch(/active/);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink.className).not.toMatch(/active/);
  });
});
