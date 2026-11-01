import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../sidepanel/components/Header';
import { Sidebar } from '../sidepanel/components/Sidebar';
import { ProgressTracker } from '../sidepanel/components/ProgressTracker';
import { ErrorCard } from '../sidepanel/components/ErrorCard';

describe('Frontend React Components', () => {
  it('renders Header with status and brand', () => {
    render(
      <Header
        backendStatus="connected"
        aiStatus="ready"
        isScanning={false}
        onScan={() => {}}
        onOpenSettings={() => {}}
      />
    );

    expect(screen.getByText('CarryON')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('AI Online')).toBeInTheDocument();
  });

  it('renders Sidebar with error count badge and handles tab clicks', () => {
    const handleTabChange = vi.fn();
    render(
      <Sidebar
        activeTab="overview"
        onTabChange={handleTabChange}
        errorCount={2}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Recovery')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Badge

    fireEvent.click(screen.getByText('Assistant'));
    expect(handleTabChange).toHaveBeenCalledWith('assistant');
  });

  it('renders ProgressTracker with steps', () => {
    render(<ProgressTracker currentStep={2} totalSteps={5} />);
    expect(screen.getByText('1. Personal Information')).toBeInTheDocument();
    expect(screen.getByText('2. Education')).toBeInTheDocument();
  });

  it('renders ErrorCard and triggers locate action', () => {
    const locateSpy = vi.fn();
    const error = {
      field_id: 'phone_num',
      field_label: 'Phone Number',
      error_type: 'invalid_phone_alphabetic',
      message: 'Alphabetic characters not allowed.',
      severity: 'error' as const,
      suggested_correction: '5550199'
    };

    render(
      <ErrorCard
        error={error}
        onLocate={locateSpy}
        onApplyFix={() => {}}
      />
    );

    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Alphabetic characters not allowed.')).toBeInTheDocument();

    const locateBtn = screen.getByText('Locate in Page');
    fireEvent.click(locateBtn);
    expect(locateSpy).toHaveBeenCalledWith('phone_num', 'Alphabetic characters not allowed.', 'error');
  });
});
