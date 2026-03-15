import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/candidates/new" element={<div>Add Candidate Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the "Add Candidate" button', () => {
    renderWithRouter();
    expect(screen.getByRole('button', { name: /add candidate/i })).toBeInTheDocument();
  });

  it('navigates to /candidates/new when "Add Candidate" is clicked', async () => {
    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(screen.getByText('Add Candidate Page')).toBeInTheDocument();
  });
});
