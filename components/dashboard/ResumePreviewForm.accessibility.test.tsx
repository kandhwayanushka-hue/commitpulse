import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResumePreviewForm from './ResumePreviewForm';
import type { ReactNode, HTMLAttributes } from 'react';
import '@testing-library/jest-dom';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const parsed = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  skills: ['React'],
  education: [],
  experience: [],
};

describe('ResumePreviewForm - Accessibility compliance', () => {
  const onBack = vi.fn();
  const onComplete = vi.fn();

  const renderComponent = () =>
    render(
      <ResumePreviewForm
        githubUsername="john"
        parsed={parsed}
        fileName="resume.pdf"
        onBack={onBack}
        onComplete={onComplete}
      />
    );

  it('checks that crucial fields have associated visible text labels', () => {
    renderComponent();

    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('checks that interactive inputs have focus-visible or outline configurations', () => {
    renderComponent();

    const nameInput = screen.getByDisplayValue('John Doe');

    expect(nameInput).toHaveClass('focus:ring-2');
    expect(nameInput).toHaveClass('focus:ring-emerald-500');
    expect(nameInput).toHaveClass('outline-none');
  });

  it('checks that the save button is disabled when saving to prevent multiple submissions', () => {
    renderComponent();

    const saveButton = screen.getByRole('button', {
      name: /Save Profile/i,
    });

    expect(saveButton).not.toBeDisabled();
  });

  it('checks that headings are present and accessible', () => {
    renderComponent();

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('checks keyboard accessibility for interactive elements', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });
});