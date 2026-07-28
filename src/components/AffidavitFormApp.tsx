import { useState } from 'react';
import FormStepper from './FormStepper';
import EligibilityCheck from './EligibilityCheck';
import DownloadButton from './DownloadButton';
import type { PDFData } from './PDFGenerator';

interface AffidavitFormAppProps {
  documentType: 'small-estate-affidavit' | 'affidavit-of-heirship' | 'tod-deed';
  state: string;
  county?: string;
  eligibilityThreshold?: number;
  waitingDays?: number;
  statutoryReference: string;
}

const fieldConfigs: Record<string, Array<{ key: string; label: string; placeholder?: string; type?: string }>> = {
  'small-estate-affidavit': [
    { key: 'deceasedName', label: 'Full name of the deceased', placeholder: 'Jane Smith' },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date' },
    { key: 'county', label: 'County where assets are located', placeholder: 'e.g. Maricopa' },
    { key: 'propertyDescription', label: 'Description of assets to transfer', placeholder: 'Bank account at Chase Bank, account ending 1234' },
    { key: 'heirName', label: 'Your full name (heir / claimant)', placeholder: 'John Smith' },
    { key: 'heirRelationship', label: 'Your relationship to the deceased', placeholder: 'Son / Daughter / Spouse' },
  ],
  'affidavit-of-heirship': [
    { key: 'deceasedName', label: 'Full name of the deceased', placeholder: 'Jane Smith' },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date' },
    { key: 'county', label: 'Texas county where property is located', placeholder: 'e.g. Harris' },
    { key: 'propertyDescription', label: 'Property description (from deed)', placeholder: 'Lot 12, Block 3, Oak Ridge Subdivision...' },
    { key: 'heirName', label: 'Heir\'s full name', placeholder: 'John Smith' },
    { key: 'heirRelationship', label: 'Relationship to deceased', placeholder: 'Son' },
    { key: 'witness1Name', label: 'First witness full name', placeholder: 'Mary Johnson (disinterested party)' },
    { key: 'witness2Name', label: 'Second witness full name', placeholder: 'Robert Williams (disinterested party)' },
  ],
  'tod-deed': [
    { key: 'grantorName', label: 'Your full legal name (grantor / property owner)', placeholder: 'Jane Smith' },
    { key: 'granteeName', label: 'Beneficiary\'s full legal name', placeholder: 'John Smith' },
    { key: 'propertyDescription', label: 'Property legal description (from your deed)', placeholder: 'Lot 5, Tract 1234, Map Book 45, Page 12...' },
    { key: 'propertyAPN', label: 'Assessor Parcel Number (APN)', placeholder: '1234-567-890' },
    { key: 'county', label: 'California county where property is located', placeholder: 'e.g. Los Angeles' },
  ],
};

const documentDescriptions: Record<string, string> = {
  'small-estate-affidavit': 'A Small Estate Affidavit allows heirs to collect and transfer assets from a deceased person\'s estate without going through full probate court — as long as the total estate value is within the state limit.',
  'affidavit-of-heirship': 'An Affidavit of Heirship establishes the identity of the heirs to a deceased person\'s property in Texas. It requires two disinterested witnesses who knew the deceased and must be recorded with the county clerk.',
  'tod-deed': 'A Transfer on Death Deed (TOD Deed) allows you to designate a beneficiary who will receive your real property when you die, without going through probate. You set it up now, and it takes effect at your death.',
};

export default function AffidavitFormApp({ documentType, state, county, eligibilityThreshold, waitingDays = 0, statutoryReference }: AffidavitFormAppProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  const fields = fieldConfigs[documentType] || fieldConfigs['small-estate-affidavit'];

  const handleEligibility = (eligible: boolean) => {
    setIsEligible(eligible);
    if (eligible) {
      setTimeout(() => setStep(3), 800);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const pdfData: PDFData = {
    documentType,
    state,
    county,
    formData,
    statutoryReference,
    waitingDays,
  };

  return (
    <div className="bg-[#EEE9E1] rounded-xl border border-[#D4CCC0] p-8 my-10 shadow-[0_2px_8px_rgba(28,28,30,0.08)]">
      <FormStepper step={step} totalSteps={4} />

      {/* Step 1: About */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl text-[#2D5016] mb-4">
            {documentType === 'small-estate-affidavit' ? 'Small Estate Affidavit' :
             documentType === 'affidavit-of-heirship' ? 'Affidavit of Heirship' :
             'Transfer on Death Deed'} — {state}{county ? `, ${county}` : ''}
          </h2>
          <p className="text-[#2C2C2A] mb-6 leading-relaxed">{documentDescriptions[documentType]}</p>
          <div className="bg-white rounded-lg p-4 border border-[#D4CCC0] mb-6 text-sm text-[#6B6560]">
            <strong className="text-[#2C2C2A]">Statutory authority:</strong> {statutoryReference}
          </div>
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 bg-[#2D5016] text-[#F7F4EF] rounded-lg font-medium hover:bg-[#2C2C2A] transition-colors"
          >
            Check if I qualify →
          </button>
        </div>
      )}

      {/* Step 2: Eligibility */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <EligibilityCheck
            threshold={eligibilityThreshold}
            thresholdLabel={eligibilityThreshold ? `This document applies if the total estate value is $${eligibilityThreshold.toLocaleString()} or less.` : ''}
            waitingDays={waitingDays}
            documentType={documentType}
            deathDate={formData.dateOfDeath}
            onEligible={handleEligibility}
          />
          {isEligible === false && (
            <p className="mt-4 text-sm text-[#6B6560]">
              Consider consulting a probate attorney for estates above the threshold.
            </p>
          )}
        </div>
      )}

      {/* Step 3: Form fields */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          <h3 className="font-serif text-xl text-[#2D5016] mb-6">Enter your details</h3>
          <div className="space-y-5">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] focus:border-transparent bg-white"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            disabled={!formData[fields[0]?.key]}
            className="mt-8 px-6 py-3 bg-[#2D5016] text-[#F7F4EF] rounded-lg font-medium hover:bg-[#2C2C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate my documents →
          </button>
        </div>
      )}

      {/* Step 4: Download */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-serif text-2xl text-[#2D5016] mb-2">Your documents are ready</h3>
          <p className="text-[#6B6560] mb-8">Your PDF bundle includes the affidavit, filing date notice, and bank instruction letter.</p>
          <DownloadButton
            pdfData={pdfData}
            fileName={`${documentType}-${state.toLowerCase().replace(' ', '-')}`}
          />
        </div>
      )}
    </div>
  );
}
