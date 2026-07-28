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

// ─── Heirship-specific types ────────────────────────────────────────────────

interface Marriage {
  spouseName: string;
  marriageDate: string;
  endDate: string;
  howEnded: 'death' | 'divorce' | 'still-married' | '';
}

interface Child {
  fullName: string;
  dob: string;
  status: 'living' | 'deceased' | '';
  relation: 'biological' | 'adopted' | '';
  grandchildren: string; // comma-separated names if child is deceased
}

interface Sibling {
  fullName: string;
  status: 'living' | 'deceased' | '';
}

interface HeirshipData {
  // Deceased
  deceasedName: string;
  deceasedDOB: string;
  dateOfDeath: string;
  countyOfDeath: string;
  stateOfDeath: string;
  // Marital history
  marriages: Marriage[];
  // Children
  children: Child[];
  // Parents
  fatherName: string;
  fatherStatus: 'living' | 'deceased' | '';
  motherName: string;
  motherStatus: 'living' | 'deceased' | '';
  // Siblings
  siblings: Sibling[];
  noSiblings: boolean;
  // Probate
  noProbate: boolean;
  probateDescription: string;
  // Residence
  lastAddress: string;
  lastCity: string;
  lastCounty: string;
  lastState: string;
  lastZip: string;
  residenceFromDate: string;
  // Property / Assets
  propertyDescription: string;
  // Witnesses
  witness1Name: string;
  witness1Address: string;
  witness1HowLong: string;
  witness1Relationship: string;
  witness2Name: string;
  witness2Address: string;
  witness2HowLong: string;
  witness2Relationship: string;
}

const emptyMarriage = (): Marriage => ({
  spouseName: '',
  marriageDate: '',
  endDate: '',
  howEnded: '',
});

const emptyChild = (): Child => ({
  fullName: '',
  dob: '',
  status: '',
  relation: '',
  grandchildren: '',
});

const emptySibling = (): Sibling => ({
  fullName: '',
  status: '',
});

const emptyHeirship = (): HeirshipData => ({
  deceasedName: '',
  deceasedDOB: '',
  dateOfDeath: '',
  countyOfDeath: '',
  stateOfDeath: 'Texas',
  marriages: [emptyMarriage()],
  children: [emptyChild()],
  fatherName: '',
  fatherStatus: '',
  motherName: '',
  motherStatus: '',
  siblings: [emptySibling()],
  noSiblings: false,
  noProbate: true,
  probateDescription: '',
  lastAddress: '',
  lastCity: '',
  lastCounty: '',
  lastState: 'Texas',
  lastZip: '',
  residenceFromDate: '',
  propertyDescription: '',
  witness1Name: '',
  witness1Address: '',
  witness1HowLong: '',
  witness1Relationship: '',
  witness2Name: '',
  witness2Address: '',
  witness2HowLong: '',
  witness2Relationship: '',
});

// ─── Non-heirship simple fields ─────────────────────────────────────────────

const fieldConfigs: Record<string, Array<{ key: string; label: string; placeholder?: string; type?: string; helperText?: string }>> = {
  'small-estate-affidavit': [
    { key: 'deceasedName', label: 'Full name of the deceased', placeholder: 'Jane Smith' },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date' },
    { key: 'county', label: 'County where assets are located', placeholder: 'e.g. Maricopa' },
    { key: 'propertyDescription', label: 'Asset Description', placeholder: 'e.g. Checking account at Chase Bank, account ending in 1234', helperText: 'Be specific — include the financial institution, account type, vehicle VIN, or property address.' },
    { key: 'heirName', label: 'Your full name (heir / claimant)', placeholder: 'John Smith' },
    { key: 'heirRelationship', label: 'Your relationship to the deceased', placeholder: 'Son / Daughter / Spouse' },
  ],
  'tod-deed': [
    { key: 'grantorName', label: 'Your full legal name (grantor / property owner)', placeholder: 'Jane Smith' },
    { key: 'grantorAddress', label: 'Your address', placeholder: '123 Main St, Los Angeles, CA 90001' },
    { key: 'granteeName', label: 'Beneficiary\'s full legal name', placeholder: 'John Smith' },
    { key: 'propertyDescription', label: 'Property legal description (from your deed)', placeholder: 'Lot 5, Tract 1234, Map Book 45, Page 12...' },
    { key: 'propertyAPN', label: 'Assessor Parcel Number (APN)', placeholder: '123-456-789', helperText: 'Format: 123-456-789' },
    { key: 'county', label: 'California county where property is located', placeholder: 'e.g. Los Angeles' },
  ],
};

const documentDescriptions: Record<string, string> = {
  'small-estate-affidavit': 'A Small Estate Affidavit allows heirs to collect and transfer assets from a deceased person\'s estate without going through full probate court — as long as the total estate value is within the state limit.',
  'affidavit-of-heirship': 'An Affidavit of Heirship establishes the identity of the heirs to a deceased person\'s property in Texas. It requires two disinterested witnesses who knew the deceased and must be recorded with the county clerk.',
  'tod-deed': 'A Transfer on Death Deed (TOD Deed) allows you to designate a beneficiary who will receive your real property when you die, without going through probate. You set it up now, and it takes effect at your death.',
};

// ─── Heirship sub-step components ────────────────────────────────────────────

function inputCls() {
  return 'w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] focus:border-transparent bg-white';
}
function labelCls() {
  return 'block text-sm font-medium text-[#2C2C2A] mb-1.5';
}
function sectionHeadingCls() {
  return 'font-serif text-lg text-[#2D5016] mb-4';
}
function addBtnCls() {
  return 'mt-3 px-4 py-2 border border-[#2D5016] text-[#2D5016] rounded-lg text-sm font-medium hover:bg-[#2D5016] hover:text-[#F7F4EF] transition-colors';
}
function removeBtnCls() {
  return 'text-xs text-[#C0392B] hover:underline mt-1';
}
function selectCls() {
  return 'w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] bg-white';
}

// Sub-step A: Deceased basic info
function DeceasedStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const set = (key: keyof HeirshipData, val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-5">
      <h3 className={sectionHeadingCls()}>Deceased person's information</h3>
      <div>
        <label className={labelCls()}>Full legal name</label>
        <input className={inputCls()} value={data.deceasedName} onChange={e => set('deceasedName', e.target.value)} placeholder="Jane Marie Smith" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls()}>Date of birth</label>
          <input type="date" className={inputCls()} value={data.deceasedDOB} onChange={e => set('deceasedDOB', e.target.value)} />
        </div>
        <div>
          <label className={labelCls()}>Date of death</label>
          <input type="date" className={inputCls()} value={data.dateOfDeath} onChange={e => set('dateOfDeath', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls()}>County of death</label>
          <input className={inputCls()} value={data.countyOfDeath} onChange={e => set('countyOfDeath', e.target.value)} placeholder="e.g. Harris" />
        </div>
        <div>
          <label className={labelCls()}>State of death</label>
          <input className={inputCls()} value={data.stateOfDeath} onChange={e => set('stateOfDeath', e.target.value)} placeholder="Texas" />
        </div>
      </div>
      <h3 className={sectionHeadingCls() + ' mt-6'}>Last known residence</h3>
      <div>
        <label className={labelCls()}>Street address</label>
        <input className={inputCls()} value={data.lastAddress} onChange={e => set('lastAddress', e.target.value)} placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className={labelCls()}>City</label>
          <input className={inputCls()} value={data.lastCity} onChange={e => set('lastCity', e.target.value)} placeholder="Houston" />
        </div>
        <div>
          <label className={labelCls()}>County</label>
          <input className={inputCls()} value={data.lastCounty} onChange={e => set('lastCounty', e.target.value)} placeholder="Harris" />
        </div>
        <div>
          <label className={labelCls()}>ZIP</label>
          <input className={inputCls()} value={data.lastZip} onChange={e => set('lastZip', e.target.value)} placeholder="77002" />
        </div>
      </div>
      <div>
        <label className={labelCls()}>State</label>
        <input className={inputCls()} value={data.lastState} onChange={e => set('lastState', e.target.value)} placeholder="Texas" />
      </div>
      <div>
        <label className={labelCls()}>Resided at this address from (date)</label>
        <input type="date" className={inputCls()} value={data.residenceFromDate} onChange={e => set('residenceFromDate', e.target.value)} />
      </div>
    </div>
  );
}

// Sub-step B: Marital history
function MarriagesStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const updateMarriage = (i: number, key: keyof Marriage, val: string) => {
    const updated = data.marriages.map((m, idx) => idx === i ? { ...m, [key]: val } : m);
    onChange({ ...data, marriages: updated });
  };
  const addMarriage = () => onChange({ ...data, marriages: [...data.marriages, emptyMarriage()] });
  const removeMarriage = (i: number) => onChange({ ...data, marriages: data.marriages.filter((_, idx) => idx !== i) });

  return (
    <div>
      <h3 className={sectionHeadingCls()}>Marital history</h3>
      <p className="text-sm text-[#6B6560] mb-4">List every marriage in chronological order, including the current or most recent.</p>
      {data.marriages.map((m, i) => (
        <div key={i} className="mb-6 p-4 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#2D5016]">Marriage {i + 1}</span>
            {data.marriages.length > 1 && (
              <button className={removeBtnCls()} onClick={() => removeMarriage(i)}>Remove</button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls()}>Spouse's full legal name</label>
              <input className={inputCls()} value={m.spouseName} onChange={e => updateMarriage(i, 'spouseName', e.target.value)} placeholder="Robert James Johnson" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls()}>Date of marriage</label>
                <input type="date" className={inputCls()} value={m.marriageDate} onChange={e => updateMarriage(i, 'marriageDate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls()}>Date ended (if applicable)</label>
                <input type="date" className={inputCls()} value={m.endDate} onChange={e => updateMarriage(i, 'endDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls()}>How did the marriage end?</label>
              <select className={selectCls()} value={m.howEnded} onChange={e => updateMarriage(i, 'howEnded', e.target.value as Marriage['howEnded'])}>
                <option value="">Select one...</option>
                <option value="death">Death of spouse</option>
                <option value="divorce">Divorce</option>
                <option value="still-married">Still married at time of death</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <button className={addBtnCls()} onClick={addMarriage}>+ Add another marriage</button>
    </div>
  );
}

// Sub-step C: Children
function ChildrenStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const updateChild = (i: number, key: keyof Child, val: string) => {
    const updated = data.children.map((c, idx) => idx === i ? { ...c, [key]: val } : c);
    onChange({ ...data, children: updated });
  };
  const addChild = () => onChange({ ...data, children: [...data.children, emptyChild()] });
  const removeChild = (i: number) => onChange({ ...data, children: data.children.filter((_, idx) => idx !== i) });

  return (
    <div>
      <h3 className={sectionHeadingCls()}>Children of the deceased</h3>
      <p className="text-sm text-[#6B6560] mb-4">Include all biological and adopted children. If a child predeceased the decedent, list their children (grandchildren of the deceased) in the final field.</p>
      {data.children.map((c, i) => (
        <div key={i} className="mb-6 p-4 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#2D5016]">Child {i + 1}</span>
            {data.children.length > 1 && (
              <button className={removeBtnCls()} onClick={() => removeChild(i)}>Remove</button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls()}>Full legal name</label>
              <input className={inputCls()} value={c.fullName} onChange={e => updateChild(i, 'fullName', e.target.value)} placeholder="Emily Jane Smith" />
            </div>
            <div>
              <label className={labelCls()}>Date of birth</label>
              <input type="date" className={inputCls()} value={c.dob} onChange={e => updateChild(i, 'dob', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls()}>Living or deceased?</label>
                <select className={selectCls()} value={c.status} onChange={e => updateChild(i, 'status', e.target.value as Child['status'])}>
                  <option value="">Select...</option>
                  <option value="living">Living</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
              <div>
                <label className={labelCls()}>Biological or adopted?</label>
                <select className={selectCls()} value={c.relation} onChange={e => updateChild(i, 'relation', e.target.value as Child['relation'])}>
                  <option value="">Select...</option>
                  <option value="biological">Biological</option>
                  <option value="adopted">Adopted</option>
                </select>
              </div>
            </div>
            {c.status === 'deceased' && (
              <div>
                <label className={labelCls()}>If this child is deceased, list their children (grandchildren of decedent) — names separated by commas</label>
                <input className={inputCls()} value={c.grandchildren} onChange={e => updateChild(i, 'grandchildren', e.target.value)} placeholder="Michael Smith, Sarah Smith" />
              </div>
            )}
          </div>
        </div>
      ))}
      <button className={addBtnCls()} onClick={addChild}>+ Add another child</button>
    </div>
  );
}

// Sub-step D: Parents & Siblings
function FamilyStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const set = (key: keyof HeirshipData, val: string | boolean) => onChange({ ...data, [key]: val });
  const updateSibling = (i: number, key: keyof Sibling, val: string) => {
    const updated = data.siblings.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    onChange({ ...data, siblings: updated });
  };
  const addSibling = () => onChange({ ...data, siblings: [...data.siblings, emptySibling()] });
  const removeSibling = (i: number) => onChange({ ...data, siblings: data.siblings.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionHeadingCls()}>Parents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
            <p className="text-sm font-medium text-[#2D5016] mb-3">Father</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls()}>Full name</label>
                <input className={inputCls()} value={data.fatherName} onChange={e => set('fatherName', e.target.value)} placeholder="William Henry Smith" />
              </div>
              <div>
                <label className={labelCls()}>Status</label>
                <select className={selectCls()} value={data.fatherStatus} onChange={e => set('fatherStatus', e.target.value as 'living' | 'deceased' | '')}>
                  <option value="">Select...</option>
                  <option value="living">Living</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-4 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
            <p className="text-sm font-medium text-[#2D5016] mb-3">Mother</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls()}>Full name</label>
                <input className={inputCls()} value={data.motherName} onChange={e => set('motherName', e.target.value)} placeholder="Dorothy Mae Williams" />
              </div>
              <div>
                <label className={labelCls()}>Status</label>
                <select className={selectCls()} value={data.motherStatus} onChange={e => set('motherStatus', e.target.value as 'living' | 'deceased' | '')}>
                  <option value="">Select...</option>
                  <option value="living">Living</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className={sectionHeadingCls()}>Siblings</h3>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={data.noSiblings}
            onChange={e => onChange({ ...data, noSiblings: e.target.checked, siblings: e.target.checked ? [] : [emptySibling()] })}
            className="w-4 h-4 accent-[#2D5016]"
          />
          <span className="text-sm text-[#2C2C2A]">Decedent had no siblings</span>
        </label>
        {!data.noSiblings && (
          <>
            {data.siblings.map((s, i) => (
              <div key={i} className="mb-4 p-4 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#2D5016]">Sibling {i + 1}</span>
                  {data.siblings.length > 1 && (
                    <button className={removeBtnCls()} onClick={() => removeSibling(i)}>Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls()}>Full name</label>
                    <input className={inputCls()} value={s.fullName} onChange={e => updateSibling(i, 'fullName', e.target.value)} placeholder="Thomas Alan Smith" />
                  </div>
                  <div>
                    <label className={labelCls()}>Status</label>
                    <select className={selectCls()} value={s.status} onChange={e => updateSibling(i, 'status', e.target.value as Sibling['status'])}>
                      <option value="">Select...</option>
                      <option value="living">Living</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className={addBtnCls()} onClick={addSibling}>+ Add another sibling</button>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-step E: Probate & Property
function ProbatePropertyStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const set = (key: keyof HeirshipData, val: string | boolean) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionHeadingCls()}>Probate proceedings</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
            style={{ borderColor: data.noProbate ? '#2D5016' : '#D4CCC0', background: data.noProbate ? '#EEF4E8' : '#F7F4EF' }}>
            <input type="radio" name="probate" checked={data.noProbate} onChange={() => set('noProbate', true)} className="mt-0.5 accent-[#2D5016]" />
            <span className="text-sm text-[#2C2C2A]">No probate proceeding has been filed or is pending for the estate of the decedent in Texas or any other state.</span>
          </label>
          <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
            style={{ borderColor: !data.noProbate ? '#2D5016' : '#D4CCC0', background: !data.noProbate ? '#EEF4E8' : '#F7F4EF' }}>
            <input type="radio" name="probate" checked={!data.noProbate} onChange={() => set('noProbate', false)} className="mt-0.5 accent-[#2D5016]" />
            <span className="text-sm text-[#2C2C2A]">A probate proceeding was filed — describe below:</span>
          </label>
          {!data.noProbate && (
            <textarea
              className={inputCls() + ' min-h-[100px]'}
              value={data.probateDescription}
              onChange={e => set('probateDescription', e.target.value)}
              placeholder="Describe the probate proceeding, court, case number, and current status..."
            />
          )}
        </div>
      </div>

      <div>
        <h3 className={sectionHeadingCls()}>Property / assets</h3>
        <p className="text-sm text-[#6B6560] mb-3">Include the full legal description of any real property (from the deed) or a description of financial accounts.</p>
        <textarea
          className={inputCls() + ' min-h-[120px]'}
          value={data.propertyDescription}
          onChange={e => set('propertyDescription', e.target.value)}
          placeholder="Lot 12, Block 3, Oak Ridge Subdivision, City of Houston, Harris County, Texas, according to the plat thereof recorded in Volume 45, Page 23 of the Map Records of Harris County, Texas.&#10;&#10;— OR —&#10;&#10;Checking account at Chase Bank, Houston, TX, account number ending in 4567."
        />
      </div>
    </div>
  );
}

// Sub-step F: Witnesses
function WitnessesStep({ data, onChange }: { data: HeirshipData; onChange: (d: HeirshipData) => void }) {
  const set = (key: keyof HeirshipData, val: string) => onChange({ ...data, [key]: val });
  const witnessBlock = (n: 1 | 2) => {
    const prefix = `witness${n}` as 'witness1' | 'witness2';
    return (
      <div className="p-5 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0] mb-6">
        <p className="text-sm font-medium text-[#2D5016] mb-4">Witness {n} — must be a disinterested person who is NOT an heir</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls()}>Full legal name</label>
            <input className={inputCls()} value={data[`${prefix}Name`]} onChange={e => set(`${prefix}Name` as keyof HeirshipData, e.target.value)} placeholder="Mary Louise Johnson" />
          </div>
          <div>
            <label className={labelCls()}>Address</label>
            <input className={inputCls()} value={data[`${prefix}Address`]} onChange={e => set(`${prefix}Address` as keyof HeirshipData, e.target.value)} placeholder="456 Oak Lane, Houston, TX 77003" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls()}>How long known the deceased</label>
              <input className={inputCls()} value={data[`${prefix}HowLong`]} onChange={e => set(`${prefix}HowLong` as keyof HeirshipData, e.target.value)} placeholder="25 years" />
            </div>
            <div>
              <label className={labelCls()}>Relationship to deceased</label>
              <input className={inputCls()} value={data[`${prefix}Relationship`]} onChange={e => set(`${prefix}Relationship` as keyof HeirshipData, e.target.value)} placeholder="Neighbor / Former coworker / Friend" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className={sectionHeadingCls()}>Two disinterested witnesses</h3>
      <div className="bg-[#FEF2F2] border border-[#C0392B] rounded-lg p-4 mb-6 text-sm text-[#2C2C2A]">
        <strong className="text-[#C0392B]">Important:</strong> Texas law requires two witnesses who (1) personally knew the deceased, (2) are not heirs, devisees, or creditors of the estate, and (3) have no financial interest in this matter. Using an heir as a witness will invalidate the affidavit.
      </div>
      {witnessBlock(1)}
      {witnessBlock(2)}
    </div>
  );
}

// ─── Heirship form sub-step navigator ────────────────────────────────────────

const HEIRSHIP_SUBSTEPS = [
  { id: 'deceased', label: 'Deceased & Residence' },
  { id: 'marriages', label: 'Marital History' },
  { id: 'children', label: 'Children' },
  { id: 'family', label: 'Parents & Siblings' },
  { id: 'probate', label: 'Probate & Property' },
  { id: 'witnesses', label: 'Witnesses' },
];

function HeirshipForm({ data, onComplete }: { data: HeirshipData; onComplete: (d: HeirshipData) => void }) {
  const [subStep, setSubStep] = useState(0);
  const [local, setLocal] = useState<HeirshipData>(data);

  const goNext = () => {
    if (subStep < HEIRSHIP_SUBSTEPS.length - 1) {
      setSubStep(s => s + 1);
    } else {
      onComplete(local);
    }
  };
  const goBack = () => setSubStep(s => Math.max(0, s - 1));

  return (
    <div>
      {/* Sub-step pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {HEIRSHIP_SUBSTEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSubStep(i)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              i === subStep
                ? 'bg-[#2D5016] text-[#F7F4EF]'
                : i < subStep
                ? 'bg-[#EEF4E8] text-[#2D5016] border border-[#2D5016]'
                : 'bg-[#EEE9E1] text-[#6B6560] border border-[#D4CCC0]'
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {subStep === 0 && <DeceasedStep data={local} onChange={setLocal} />}
        {subStep === 1 && <MarriagesStep data={local} onChange={setLocal} />}
        {subStep === 2 && <ChildrenStep data={local} onChange={setLocal} />}
        {subStep === 3 && <FamilyStep data={local} onChange={setLocal} />}
        {subStep === 4 && <ProbatePropertyStep data={local} onChange={setLocal} />}
        {subStep === 5 && <WitnessesStep data={local} onChange={setLocal} />}
      </div>

      <div className="flex gap-3 mt-8">
        {subStep > 0 && (
          <button
            onClick={goBack}
            className="px-5 py-2.5 border border-[#D4CCC0] text-[#2C2C2A] rounded-lg font-medium hover:bg-[#EEE9E1] transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={goNext}
          className="px-6 py-3 bg-[#2D5016] text-[#F7F4EF] rounded-lg font-medium hover:bg-[#2C2C2A] transition-colors"
        >
          {subStep < HEIRSHIP_SUBSTEPS.length - 1 ? 'Continue →' : 'Generate my affidavit →'}
        </button>
      </div>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────

// ─── California county list ───────────────────────────────────────────────────

const CA_COUNTIES = ['Los Angeles', 'San Diego', 'Orange', 'Riverside', 'San Bernardino', 'Santa Clara', 'Alameda', 'Sacramento', 'Contra Costa', 'Fresno', 'Kern', 'San Francisco', 'Ventura', 'San Mateo', 'San Joaquin', 'Stanislaus', 'Sonoma', 'Tulare', 'Santa Barbara', 'Solano', 'Monterey', 'Placer', 'San Luis Obispo', 'Santa Cruz', 'Marin', 'Merced', 'Butte', 'Yolo', 'El Dorado', 'Imperial', 'Shasta', 'Kings', 'Madera', 'Napa', 'Humboldt', 'Nevada', 'Mendocino', 'Sutter', 'Yuba', 'Lake', 'San Benito', 'Tehama', 'Tuolumne', 'Calaveras', 'Siskiyou', 'Amador', 'Lassen', 'Del Norte', 'Glenn', 'Plumas', 'Colusa', 'Modoc', 'Sierra', 'Trinity', 'Mono', 'Inyo', 'Alpine'];

function findClosestCounty(input: string): string | null {
  const lower = input.toLowerCase();
  const exact = CA_COUNTIES.find(c => c.toLowerCase() === lower);
  if (exact) return null; // matches, no suggestion needed
  const partial = CA_COUNTIES.find(c => c.toLowerCase().startsWith(lower) || lower.startsWith(c.toLowerCase().slice(0, 3)));
  return partial || null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateForm(data: Record<string, string>, docType: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (docType === 'tod-deed') {
    if (!data.grantorName?.trim()) errors.grantorName = 'Required';
    if (!data.granteeName?.trim()) errors.granteeName = 'Required';
    if (!data.propertyDescription?.trim()) errors.propertyDescription = 'Required';
    if (!data.propertyAPN?.trim()) errors.propertyAPN = 'Required';
    if (!data.county?.trim()) {
      errors.county = 'Required';
    } else {
      const lower = data.county.trim().toLowerCase();
      const matched = CA_COUNTIES.some(c => c.toLowerCase() === lower);
      if (!matched) {
        const closest = findClosestCounty(data.county.trim());
        errors.county = closest
          ? `Did you mean "${closest}"? Check county spelling.`
          : 'Not a recognized California county — check spelling.';
      }
    }
    return errors;
  }

  if (!data.deceasedName?.trim()) errors.deceasedName = 'Required';
  if (!data.dateOfDeath?.trim()) errors.dateOfDeath = 'Required';
  if (!data.county?.trim()) errors.county = 'Required';
  if (!data.heirName?.trim()) errors.heirName = 'Required';
  if (!data.propertyDescription?.trim()) errors.propertyDescription = 'Required';
  return errors;
}

function isFormValid(data: Record<string, string>, docType: string): boolean {
  // For TOD deed, county warning doesn't block download — only hard-required fields do
  if (docType === 'tod-deed') {
    const errors = validateForm(data, docType);
    const hardErrors = Object.entries(errors).filter(([key, _]) => key !== 'county' || !data.county?.trim());
    // county warning (unrecognized but non-empty) should NOT block
    const countyVal = data.county?.trim() || '';
    const countyIsRecognized = CA_COUNTIES.some(c => c.toLowerCase() === countyVal.toLowerCase());
    const countyIsEmpty = !countyVal;
    const countyError = errors.county;
    const blockingErrors = Object.entries(errors).filter(([key, msg]) => {
      if (key === 'county' && !countyIsEmpty && !countyIsRecognized) return false; // warn only
      return true;
    });
    return blockingErrors.length === 0;
  }
  return Object.keys(validateForm(data, docType)).length === 0;
}

// ─── Next Steps Checklist ────────────────────────────────────────────────────

function NextStepsCard({ onDownloadAgain, onStartOver }: { onDownloadAgain: () => void; onStartOver: () => void }) {
  const items = [
    'Sign the affidavit before a notary public (do NOT sign in advance)',
    'Obtain a certified copy of the death certificate',
    'Bring a valid government-issued photo ID',
    'Verify the waiting period has passed since date of death',
    "Confirm the estate value is under your state's threshold",
  ];
  return (
    <div className="bg-[#EEF4E8] border border-[#2D5016] rounded-xl p-6 text-left">
      <p className="font-serif text-xl text-[#2D5016] mb-4">✅ Your document has been generated!</p>
      <p className="text-sm font-semibold text-[#2C2C2A] mb-3">Before Filing — Next Steps:</p>
      <ul className="space-y-2 mb-6">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#2C2C2A]">
            <span className="mt-0.5 text-[#2D5016] flex-shrink-0">☐</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onDownloadAgain}
          className="px-5 py-2.5 border border-[#2D5016] text-[#2D5016] rounded-lg font-medium text-sm hover:bg-[#2D5016] hover:text-[#F7F4EF] transition-colors"
        >
          Download Again
        </button>
        <button
          onClick={onStartOver}
          className="px-5 py-2.5 bg-[#2C2C2A] text-[#F7F4EF] rounded-lg font-medium text-sm hover:bg-[#2D5016] transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

// ─── Affiant Section ─────────────────────────────────────────────────────────

interface AffiántData {
  affinatName: string;
  affiantAddress: string;
  affiantRelationship: '' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
}

function AffiантSection({ data, onChange }: { data: AffiántData; onChange: (d: AffiántData) => void }) {
  return (
    <div className="mt-8 p-5 bg-[#F7F4EF] rounded-lg border border-[#D4CCC0]">
      <p className="text-sm font-semibold text-[#2D5016] mb-1">Affiant Information (optional)</p>
      <p className="text-xs text-[#6B6560] mb-4">If the person filing this affidavit is different from the heir, enter their details below. Leave blank to use the heir's name on the signature block.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Affiant Full Name</label>
          <input
            type="text"
            value={data.affinatName}
            onChange={e => onChange({ ...data, affinatName: e.target.value })}
            placeholder="If different from heir name — leave blank to use heir name"
            className="w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] focus:border-transparent bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Affiant Mailing Address</label>
          <input
            type="text"
            value={data.affiantAddress}
            onChange={e => onChange({ ...data, affiantAddress: e.target.value })}
            placeholder="123 Main St, City, State 12345"
            className="w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] focus:border-transparent bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Affiant Relationship to Deceased</label>
          <select
            value={data.affiantRelationship}
            onChange={e => onChange({ ...data, affiantRelationship: e.target.value as AffiántData['affiantRelationship'] })}
            className="w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] bg-white"
          >
            <option value="">Select relationship...</option>
            <option value="Spouse">Spouse</option>
            <option value="Child">Child</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function AffidavitFormApp({
  documentType,
  state,
  county,
  eligibilityThreshold,
  waitingDays = 0,
  statutoryReference,
}: AffidavitFormAppProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [heirshipData, setHeirshipData] = useState<HeirshipData>(emptyHeirship());
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [affiántData, setAffiántData] = useState<AffiántData>({
    affinatName: '',
    affiantAddress: '',
    affiantRelationship: '',
  });

  const isHeirship = documentType === 'affidavit-of-heirship';
  const fields = fieldConfigs[documentType] || fieldConfigs['small-estate-affidavit'];

  const validationErrors = validateForm(formData, documentType);
  const formIsValid = isFormValid(formData, documentType);

  const getFieldError = (key: string): string | undefined => {
    if ((touchedFields[key] || submitAttempted) && validationErrors[key]) {
      return validationErrors[key];
    }
    return undefined;
  };

  const handleBlur = (key: string) => {
    setTouchedFields(prev => ({ ...prev, [key]: true }));
  };

  const handleEligibility = (eligible: boolean) => {
    setIsEligible(eligible);
    if (eligible) {
      setTimeout(() => setStep(3), 800);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateClick = () => {
    if (!formIsValid) {
      setSubmitAttempted(true);
      return;
    }
    setStep(4);
  };

  // Serialize heirship data into formData for PDFData compatibility
  const serializedHeirshipFormData: Record<string, string> = {
    deceasedName: heirshipData.deceasedName,
    deceasedDOB: heirshipData.deceasedDOB,
    dateOfDeath: heirshipData.dateOfDeath,
    countyOfDeath: heirshipData.countyOfDeath,
    stateOfDeath: heirshipData.stateOfDeath,
    lastAddress: heirshipData.lastAddress,
    lastCity: heirshipData.lastCity,
    lastCounty: heirshipData.lastCounty,
    lastState: heirshipData.lastState,
    lastZip: heirshipData.lastZip,
    residenceFromDate: heirshipData.residenceFromDate,
    marriages: JSON.stringify(heirshipData.marriages),
    children: JSON.stringify(heirshipData.children),
    fatherName: heirshipData.fatherName,
    fatherStatus: heirshipData.fatherStatus,
    motherName: heirshipData.motherName,
    motherStatus: heirshipData.motherStatus,
    siblings: JSON.stringify(heirshipData.siblings),
    noSiblings: String(heirshipData.noSiblings),
    noProbate: String(heirshipData.noProbate),
    probateDescription: heirshipData.probateDescription,
    propertyDescription: heirshipData.propertyDescription,
    witness1Name: heirshipData.witness1Name,
    witness1Address: heirshipData.witness1Address,
    witness1HowLong: heirshipData.witness1HowLong,
    witness1Relationship: heirshipData.witness1Relationship,
    witness2Name: heirshipData.witness2Name,
    witness2Address: heirshipData.witness2Address,
    witness2HowLong: heirshipData.witness2HowLong,
    witness2Relationship: heirshipData.witness2Relationship,
    // Affiant fields
    affinatName: affiántData.affinatName,
    affiantAddress: affiántData.affiantAddress,
    affiantRelationship: affiántData.affiantRelationship,
  };

  const pdfData: PDFData = {
    documentType,
    state,
    county,
    formData: isHeirship ? serializedHeirshipFormData : {
      ...formData,
      affinatName: affiántData.affinatName,
      affiantAddress: affiántData.affiantAddress,
      affiantRelationship: affiántData.affiantRelationship,
    },
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
          {isHeirship && (
            <div className="bg-[#EEF4E8] border border-[#2D5016] rounded-lg p-4 mb-5 text-sm text-[#2C2C2A]">
              <strong className="text-[#2D5016]">What you'll need:</strong> Deceased's full family history (marriages, all children, parents, siblings), two disinterested witnesses, and the legal description of any property.
            </div>
          )}
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
            deathDate={isHeirship ? heirshipData.dateOfDeath : formData.dateOfDeath}
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
          {isHeirship ? (
            <>
              <h3 className="font-serif text-xl text-[#2D5016] mb-2">Complete the Affidavit of Heirship</h3>
              <p className="text-sm text-[#6B6560] mb-6">Work through each section. You can navigate between sections using the pills above.</p>
              <HeirshipForm
                data={heirshipData}
                onComplete={(d) => {
                  setHeirshipData(d);
                  setStep(4);
                }}
              />
              <AffiантSection data={affiántData} onChange={setAffiántData} />
            </>
          ) : (
            <>
              <h3 className="font-serif text-xl text-[#2D5016] mb-6">Enter your details</h3>
              <div className="space-y-5">
                {fields.map(field => {
                  const error = getFieldError(field.key);
                  // County field for TOD deed: show warning (yellow) not hard error (red)
                  const isTODCountyWarning = documentType === 'tod-deed' && field.key === 'county' && error && formData[field.key]?.trim();
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        onBlur={() => handleBlur(field.key)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 border rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
                          error && !isTODCountyWarning
                            ? 'border-[#C0392B] focus:ring-[#C0392B]'
                            : isTODCountyWarning
                            ? 'border-[#F59E0B] focus:ring-[#F59E0B]'
                            : 'border-[#D4CCC0] focus:ring-[#8B6914]'
                        }`}
                      />
                      {field.helperText && !error && (
                        <p className="mt-1 text-xs text-[#6B6560]">{field.helperText}</p>
                      )}
                      {error && !isTODCountyWarning && (
                        <p className="mt-1 text-xs text-[#C0392B] font-medium">{error}</p>
                      )}
                      {isTODCountyWarning && (
                        <p className="mt-1 text-xs text-[#92400E] font-medium">⚠ {error}</p>
                      )}
                    </div>
                  );
                })}
                {documentType === 'tod-deed' && (
                  <div>
                    <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Beneficiary's relationship to you (optional)</label>
                    <select
                      value={formData['beneficiaryRelationship'] || ''}
                      onChange={e => handleFieldChange('beneficiaryRelationship', e.target.value)}
                      className="w-full px-4 py-3 border border-[#D4CCC0] rounded-lg text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#8B6914] bg-white"
                    >
                      <option value="">Not specified</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>
              <AffiантSection data={affiántData} onChange={setAffiántData} />
              <button
                onClick={handleGenerateClick}
                disabled={false}
                className={`mt-8 px-6 py-3 rounded-lg font-medium transition-colors ${
                  formIsValid
                    ? 'bg-[#2D5016] text-[#F7F4EF] hover:bg-[#2C2C2A]'
                    : 'bg-[#D4CCC0] text-[#6B6560] cursor-not-allowed'
                }`}
              >
                {formIsValid ? 'Download Free PDF' : 'Complete all fields to generate'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 4: Download */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto text-center">
          {!downloadComplete ? (
            <>
              <h3 className="font-serif text-2xl text-[#2D5016] mb-2">Your documents are ready</h3>
              <p className="text-[#6B6560] mb-8">
                {isHeirship
                  ? 'Your PDF includes the full Texas-compliant Affidavit of Heirship with all sections required by county clerks and title companies.'
                  : 'Your PDF bundle includes the affidavit, filing date notice, and bank instruction letter.'}
              </p>
              <DownloadButton
                pdfData={pdfData}
                fileName={`${documentType}-${state.toLowerCase().replace(' ', '-')}`}
                onDownloaded={() => setDownloadComplete(true)}
              />
              {isHeirship && (
                <button
                  onClick={() => setStep(3)}
                  className="mt-4 block mx-auto text-sm text-[#8B6914] hover:underline"
                >
                  ← Edit my answers
                </button>
              )}
            </>
          ) : (
            <NextStepsCard
              onDownloadAgain={() => setDownloadComplete(false)}
              onStartOver={() => {
                setStep(1);
                setFormData({});
                setHeirshipData(emptyHeirship());
                setIsEligible(null);
                setTouchedFields({});
                setSubmitAttempted(false);
                setDownloadComplete(false);
                setAffiántData({ affinatName: '', affiantAddress: '', affiantRelationship: '' });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
