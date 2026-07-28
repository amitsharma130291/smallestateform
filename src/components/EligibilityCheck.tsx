import { useState } from 'react';

interface EligibilityCheckProps {
  threshold?: number;
  thresholdLabel: string;
  waitingDays: number;
  documentType: string;
  deathDate?: string;
  onEligible: (eligible: boolean) => void;
}

export default function EligibilityCheck({ threshold, thresholdLabel, waitingDays, documentType, deathDate, onEligible }: EligibilityCheckProps) {
  const [assetValue, setAssetValue] = useState('');
  const [checked, setChecked] = useState(false);

  // For TOD deed and AOH — no threshold check needed
  const hasThreshold = threshold !== undefined && threshold > 0;

  const handleCheck = () => {
    setChecked(true);
    if (!hasThreshold) {
      onEligible(true);
      return;
    }
    const value = parseFloat(assetValue.replace(/[,$]/g, ''));
    onEligible(!isNaN(value) && value <= threshold);
  };

  const formatCurrency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const getFilingDate = () => {
    if (!deathDate || waitingDays === 0) return null;
    const d = new Date(deathDate);
    d.setDate(d.getDate() + waitingDays);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const eligible = hasThreshold
    ? !isNaN(parseFloat(assetValue.replace(/[,$]/g, ''))) && parseFloat(assetValue.replace(/[,$]/g, '')) <= (threshold || 0)
    : true;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl text-[#2D5016] mb-2">Does this document apply to your situation?</h3>
        {hasThreshold && (
          <p className="text-[#6B6560] text-sm mb-4">{thresholdLabel}</p>
        )}
      </div>

      {hasThreshold && (
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-2">
            Approximate value of assets to transfer ($)
          </label>
          <input
            type="text"
            value={assetValue}
            onChange={e => setAssetValue(e.target.value)}
            placeholder="e.g. 85,000"
            className="w-full max-w-xs px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] focus:border-transparent bg-white"
          />
        </div>
      )}

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={hasThreshold && !assetValue}
          className="px-6 py-3 bg-[#2D5016] text-[#F7F4EF] rounded-lg font-medium hover:bg-[#2C2C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check eligibility
        </button>
      )}

      {checked && eligible && (
        <div className="bg-[#EEF4E8] border border-[#2D5016] rounded-lg p-5">
          <div className="flex items-start gap-3">
            <span className="text-[#2D5016] text-lg">✓</span>
            <div>
              <p className="font-medium text-[#2D5016] mb-1">
                {hasThreshold
                  ? `Your estate of ${formatCurrency(parseFloat(assetValue.replace(/[,$]/g, '')))} qualifies under the ${formatCurrency(threshold!)} limit`
                  : `This document applies to your situation`
                }
              </p>
              {waitingDays > 0 && getFilingDate() && (
                <p className="text-[#2C2C2A] text-sm">You may file on or after <strong>{getFilingDate()}</strong></p>
              )}
              {waitingDays === 0 && (
                <p className="text-[#2C2C2A] text-sm">You may proceed immediately.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {checked && !eligible && (
        <div className="bg-red-50 border border-[#9B2335] rounded-lg p-5">
          <p className="font-medium text-[#9B2335]">The estate value may be above the threshold</p>
          <p className="text-[#2C2C2A] text-sm mt-1">The threshold for this document is {formatCurrency(threshold!)}. For larger estates, full probate may be required. Consult a licensed attorney.</p>
        </div>
      )}
    </div>
  );
}
