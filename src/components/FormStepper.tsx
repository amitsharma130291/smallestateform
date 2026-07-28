interface FormStepperProps {
  step: number;
  totalSteps: number;
}

const stepLabels = ['About', 'Eligibility', 'Your Details', 'Download'];

export default function FormStepper({ step, totalSteps }: FormStepperProps) {
  return (
    <div className="flex items-center justify-center mb-10 px-4">
      {stepLabels.map((label, index) => {
        const stepNum = index + 1;
        const isComplete = step > stepNum;
        const isActive = step === stepNum;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                isComplete ? 'bg-[#B8860B] border-[#B8860B] text-[#FAF8F5]' :
                isActive ? 'bg-white border-[#B8860B] text-[#B8860B]' :
                'bg-white border-[#E5E0D8] text-[#6B6B6B]'
              }`}>
                {isComplete ? '✓' : stepNum}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-[#1C1C1E]' : 'text-[#6B6B6B]'}`}>
                {label}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-px w-12 md:w-20 mx-2 mb-5 transition-colors ${step > stepNum ? 'bg-[#B8860B]' : 'bg-[#E5E0D8]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
