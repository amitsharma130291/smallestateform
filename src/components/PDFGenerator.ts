// @ts-ignore -- jsPDF types
import { jsPDF } from 'jspdf';

export interface PDFData {
  documentType: 'small-estate-affidavit' | 'affidavit-of-heirship' | 'tod-deed';
  state: string;
  county?: string;
  formData: Record<string, string>;
  statutoryReference: string;
  waitingDays: number;
}

const documentTitles: Record<string, string> = {
  'small-estate-affidavit': 'SMALL ESTATE AFFIDAVIT',
  'affidavit-of-heirship': 'AFFIDAVIT OF HEIRSHIP',
  'tod-deed': 'REVOCABLE TRANSFER ON DEATH DEED',
};

const bankLetterText: Record<string, string> = {
  'small-estate-affidavit': 'Under [STATUTORY_REFERENCE], financial institutions are legally required to accept a properly executed Small Estate Affidavit and release the assets described herein to the claimant. Failure to comply within a reasonable time may subject the institution to liability for damages, including attorney\'s fees and costs.',
  'affidavit-of-heirship': 'Under Texas Estates Code Chapter 203, a recorded Affidavit of Heirship constitutes prima facie evidence of the facts stated therein. Financial institutions and title companies are advised to accept this document as proof of heirship and succession.',
  'tod-deed': 'Under California Civil Code §5600–5696, a properly recorded Revocable Transfer on Death Deed transfers the described real property to the designated beneficiary upon the grantor\'s death, without probate.',
};

export function generateAffidavitPDF(data: PDFData): jsPDF {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  const margin = 1;
  const pageWidth = 8.5;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addText = (text: string, x: number, size: number = 11, style: string = 'normal', align: 'left' | 'center' = 'left') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    if (align === 'center') {
      doc.text(text, pageWidth / 2, y, { align: 'center' });
    } else {
      const lines = doc.splitTextToSize(text, contentWidth - (x - margin));
      doc.text(lines, x, y);
      y += (lines.length - 1) * 0.2;
    }
    y += size * 0.0175;
  };

  const addLine = () => {
    y += 0.1;
    doc.setDrawColor(180, 170, 160);
    doc.line(margin, y, pageWidth - margin, y);
    y += 0.2;
  };

  const addSpace = (amount: number = 0.2) => { y += amount; };

  // === PAGE 1: AFFIDAVIT ===
  // Header
  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, pageWidth, 1.2, 'F');
  doc.setTextColor(250, 248, 245);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(documentTitles[data.documentType] || 'LEGAL AFFIDAVIT', pageWidth / 2, 0.6, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pursuant to ${data.statutoryReference}`, pageWidth / 2, 0.9, { align: 'center' });

  y = 1.5;
  doc.setTextColor(61, 61, 61);

  // State and Date
  addText(`State: ${data.state}${data.county ? ` | County: ${data.county}` : ''}`, margin, 10);
  addSpace(0.05);
  addText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 10);
  addLine();

  // Form data
  const fieldLabels: Record<string, string> = {
    deceasedName: 'Name of Deceased',
    dateOfDeath: 'Date of Death',
    county: 'County',
    propertyDescription: 'Property / Asset Description',
    heirName: 'Heir / Beneficiary Name',
    heirRelationship: 'Relationship to Deceased',
    witness1Name: 'Witness 1 Name',
    witness2Name: 'Witness 2 Name',
    grantorName: 'Grantor Name',
    granteeName: 'Grantee / Beneficiary Name',
    propertyAPN: 'Assessor Parcel Number (APN)',
  };

  Object.entries(data.formData).forEach(([key, value]) => {
    if (value && fieldLabels[key]) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 107, 107);
      doc.text(fieldLabels[key], margin, y);
      y += 0.2;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(61, 61, 61);
      doc.text(value, margin, y);
      y += 0.4;
    }
  });

  addLine();
  addSpace(0.2);

  // Signature lines
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(61, 61, 61);
  doc.text('Signature of Affiant: ___________________________________  Date: _______________', margin, y);
  y += 0.6;
  doc.text('Notary Public Signature: _______________________________  Date: _______________', margin, y);
  y += 0.3;
  doc.text('Commission Expires: ____________________________________', margin, y);

  // === PAGE 2: WAITING PERIOD ===
  doc.addPage();
  y = margin;
  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, pageWidth, 0.8, 'F');
  doc.setTextColor(250, 248, 245);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FILING DATE NOTICE', pageWidth / 2, 0.5, { align: 'center' });

  y = 1.2;
  doc.setTextColor(61, 61, 61);

  if (data.waitingDays > 0 && data.formData.dateOfDeath) {
    const deathDate = new Date(data.formData.dateOfDeath);
    const filingDate = new Date(deathDate);
    filingDate.setDate(filingDate.getDate() + data.waitingDays);
    const filingDateStr = filingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('You may file this document on or after:', pageWidth / 2, y, { align: 'center' });
    y += 0.5;
    doc.setFontSize(22);
    doc.text(filingDateStr, pageWidth / 2, y, { align: 'center' });
    y += 0.6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`This date is ${data.waitingDays} days after the date of death (${data.formData.dateOfDeath}),`, pageWidth / 2, y, { align: 'center' });
    y += 0.25;
    doc.text(`as required by ${data.statutoryReference}.`, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('No waiting period applies to this document type.', pageWidth / 2, y, { align: 'center' });
    y += 0.4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('You may file immediately after completing and notarizing this document.', pageWidth / 2, y, { align: 'center' });
  }

  // === PAGE 3: BANK INSTRUCTION LETTER ===
  doc.addPage();
  y = margin;
  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, pageWidth, 0.8, 'F');
  doc.setTextColor(250, 248, 245);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BANK / FINANCIAL INSTITUTION INSTRUCTION LETTER', pageWidth / 2, 0.5, { align: 'center' });

  y = 1.2;
  doc.setTextColor(61, 61, 61);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 0.4;

  const letterText = (bankLetterText[data.documentType] || bankLetterText['small-estate-affidavit'])
    .replace('[STATUTORY_REFERENCE]', data.statutoryReference);

  doc.setFontSize(11);
  const wrappedLetter = doc.splitTextToSize(
    `To Whom It May Concern,\n\nThis letter accompanies a legally executed ${documentTitles[data.documentType]} for the estate of ${data.formData.deceasedName || '[Deceased]'}, who passed away on ${data.formData.dateOfDeath || '[date]'}.\n\n${letterText}\n\nPlease process the transfer of the following assets to the designated heir or beneficiary as described in the accompanying affidavit:\n\n${data.formData.propertyDescription || data.formData.heirName || '[See affidavit]'}\n\nShould you require any additional documentation, please contact the affiant directly.\n\nRespectfully,\n\n___________________________________\nAffiant Signature\n\n${data.formData.heirName || ''}`,
    contentWidth
  );
  doc.text(wrappedLetter, margin, y);

  return doc;
}
