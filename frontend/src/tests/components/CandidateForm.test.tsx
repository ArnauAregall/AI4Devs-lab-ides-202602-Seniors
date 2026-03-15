import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CandidateForm from '../../components/CandidateForm/CandidateForm';
import * as candidatesApi from '../../api/candidatesApi';
import { ApiError } from '../../api/types';

const mockCandidate = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: null,
  address: null,
  source: null,
  notes: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'user-1',
  educations: [],
  workExperiences: [],
  cv: null,
};

jest.mock('../../api/candidatesApi');
const mockCreateCandidate = candidatesApi.createCandidate as jest.MockedFunction<
  typeof candidatesApi.createCandidate
>;

function renderForm() {
  return render(
    <MemoryRouter>
      <CandidateForm />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('CandidateForm — happy path', () => {
  it('renders all required fields', () => {
    renderForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('submits the form and shows success message with candidate name', async () => {
    mockCreateCandidate.mockResolvedValue(mockCandidate);
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Jane Doe');
    });
    expect(mockCreateCandidate).toHaveBeenCalledTimes(1);
  });

  it('resets the form when "Add another" is clicked after success', async () => {
    mockCreateCandidate.mockResolvedValue(mockCandidate);
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => screen.getByRole('status'));
    await userEvent.click(screen.getByRole('button', { name: /add another/i }));

    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
  });
});

describe('CandidateForm — client-side validation errors', () => {
  it('shows errors for empty required fields on submit', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(mockCreateCandidate).not.toHaveBeenCalled();
  });

  it('shows firstName error when first name is empty', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  });

  it('shows email error for invalid email format', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'not-valid');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });
});

describe('CandidateForm — dynamic education rows', () => {
  it('adds an education row when "Add education" is clicked', async () => {
    renderForm();
    expect(screen.queryByLabelText(/degree/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /add education/i }));
    expect(screen.getByLabelText(/degree/i)).toBeInTheDocument();
  });

  it('adds two education rows and shows both', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /add education/i }));
    await userEvent.click(screen.getByRole('button', { name: /add education/i }));

    expect(screen.getAllByLabelText(/degree/i)).toHaveLength(2);
  });

  it('removes an education row when "Remove" is clicked', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /add education/i }));
    await userEvent.click(screen.getByRole('button', { name: /add education/i }));

    expect(screen.getAllByLabelText(/degree/i)).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    expect(screen.getAllByLabelText(/degree/i)).toHaveLength(1);
  });
});

describe('CandidateForm — dynamic work experience rows', () => {
  it('adds a work experience row when "Add job" is clicked', async () => {
    renderForm();
    expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /add job/i }));
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
  });

  it('adds two work experience rows and shows both', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /add job/i }));
    await userEvent.click(screen.getByRole('button', { name: /add job/i }));

    expect(screen.getAllByLabelText(/company/i)).toHaveLength(2);
  });

  it('removes a work experience row when "Remove" is clicked', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /add job/i }));
    await userEvent.click(screen.getByRole('button', { name: /add job/i }));

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    expect(screen.getAllByLabelText(/company/i)).toHaveLength(1);
  });
});

describe('CandidateForm — server-side error mapping', () => {
  const fillRequired = async () => {
    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
  };

  it('shows field-level errors from 400 fieldErrors', async () => {
    mockCreateCandidate.mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', {
        email: 'Email already taken by another candidate',
      })
    );
    renderForm();
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already taken/i)).toBeInTheDocument();
    });
  });

  it('shows a conflict message on 409 response', async () => {
    mockCreateCandidate.mockRejectedValue(
      new ApiError(409, 'DUPLICATE_EMAIL', 'A candidate with this email address already exists.')
    );
    renderForm();
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i);
    });
  });

  it('shows a generic error message on 500 response', async () => {
    mockCreateCandidate.mockRejectedValue(
      new ApiError(500, 'INTERNAL_ERROR', 'Internal server error')
    );
    renderForm();
    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unexpected error/i);
    });
  });
});

describe('CandidateForm — CV upload field', () => {
  it('displays file name and size when a valid PDF is selected', async () => {
    renderForm();

    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/cv \/ resume/i);

    await userEvent.upload(fileInput, file);

    expect(screen.getByText(/resume\.pdf/i)).toBeInTheDocument();
  });

  it('shows an error when a disallowed file type is submitted', async () => {
    renderForm();

    const file = new File(['content'], 'resume.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/cv \/ resume/i);
    await userEvent.upload(fileInput, file);

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(screen.getByText(/only pdf and docx/i)).toBeInTheDocument();
    });
  });
});
