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
    <div className="relative space-y-1.5 py-0.5">
      {items.map((item, idx) => (
        <div key={item.stepNum} className="relative">
          {/* Subtle connecting vertical line between roadmap steps */}
          {idx < items.length - 1 && (
            <div
              className={`absolute left-5 top-7 bottom-0 w-[1.5px] -mb-1.5 z-0 ${
                item.isCompleted ? 'bg-[#00DB85]/40' : 'bg-[#1A2B42]'
              }`}
            />
          )}

          <div
            className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all relative z-10 ${
              item.isCurrent
                ? 'bg-[#0E2038] border border-[#00D9F5]/70 shadow-[0_0_12px_rgba(0,217,245,0.18)] text-[#F4F8FF]'
                : item.isCompleted
                ? 'bg-[#0B1726] border border-[#1A2B42] text-[#94A3B8]'
                : 'bg-[#0B1726]/40 border border-[#1A2B42]/50 text-[#64748B]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center shrink-0 w-5 h-5">
                {item.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00DB85]" />
                ) : item.isCurrent ? (
                  <Clock className="w-4 h-4 text-[#00D9F5] animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-[#64748B]" />
                )}
              </div>
              <span className={`truncate font-semibold tracking-tight ${item.isCurrent ? 'text-[#F4F8FF]' : ''}`}>
                {item.stepNum}. {item.title}
              </span>
            </div>

            {/* Clean minimal status text - NO badges or pill containers */}
            <span
              className={`text-[11px] font-mono uppercase tracking-wider shrink-0 font-semibold ${
                item.isCompleted
                  ? 'text-[#00DB85]'
                  : item.isCurrent
                  ? 'text-[#00D9F5]'
                  : 'text-[#64748B]'
              }`}
            >
              {item.isCompleted ? 'Done' : item.isCurrent ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
