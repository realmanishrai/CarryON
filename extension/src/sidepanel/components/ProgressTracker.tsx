import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { WorkflowStep } from '../../shared/types';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps?: WorkflowStep[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  const defaultStepTitles = [
    'Personal Information',
    'Education',
    'Experience',
    'Skills and Resume',
    'Review and Submit'
  ];

  const items = Array.from({ length: totalSteps || 5 }, (_, i) => {
    const stepNum = i + 1;
    const stepObj = steps?.find((s) => s.step_index === stepNum);
    const title = stepObj?.title || defaultStepTitles[i] || `Section ${stepNum}`;
    const isCompleted = stepNum < currentStep;
    const isCurrent = stepNum === currentStep;

    return { stepNum, title, isCompleted, isCurrent };
  });

  return (
    <div className="space-y-2 py-1">
      {items.map((item) => (
        <div
          key={item.stepNum}
          className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
            item.isCurrent
              ? 'bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 text-[#F3F4F6]'
              : item.isCompleted
              ? 'bg-[#191F2B]/40 text-[#9CA3AF]'
              : 'bg-[#191F2B]/10 text-[#64748B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {item.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : item.isCurrent ? (
              <Clock className="w-4 h-4 text-[#8B7CFF] animate-pulse" />
            ) : (
              <Circle className="w-4 h-4 text-[#475569]" />
            )}
            <span className={`font-medium ${item.isCurrent ? 'text-white' : ''}`}>
              {item.stepNum}. {item.title}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
            {item.isCompleted ? 'Done' : item.isCurrent ? 'Active' : 'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
};
