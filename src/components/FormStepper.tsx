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
                isComplete ? 'bg-[#8B6914] border-[#8B6914] text-[#F7F4EF]' :
                isActive ? 'bg-white border-[#8B6914] text-[#8B6914]' :
                'bg-white border-[#D4CCC0] text-[#6B6560]'
              }`}>
                {isComplete ? '✓' : stepNum}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-[#2D5016]' : 'text-[#6B6560]'}`}>
                {label}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-px w-12 md:w-20 mx-2 mb-5 transition-colors ${step > stepNum ? 'bg-[#8B6914]' : 'bg-[#D4CCC0]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
