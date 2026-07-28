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

// ─── Helper types for heirship ───────────────────────────────────────────────

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
  grandchildren: string;
}

interface Sibling {
  fullName: string;
  status: 'living' | 'deceased' | '';
}

function parseJson<T>(val: string | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

function fmt(d: string | undefined): string {
  if (!d) return '________________';
  try {
    const [y, m, day] = d.split('-');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  } catch { return d; }
}

// ─── Full Texas-compliant Affidavit of Heirship ──────────────────────────────

export function generateHeirshipAffidavit(data: PDFData): jsPDF {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  const margin = 1;
  const pageWidth = 8.5;
  const pageHeight = 11;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const fd = data.formData;

  // Parse serialized arrays
  const marriages = parseJson<Marriage[]>(fd.marriages, []);
  const children = parseJson<Child[]>(fd.children, []);
  const siblings = parseJson<Sibling[]>(fd.siblings, []);
  const noSiblings = fd.noSiblings === 'true';
  const noProbate = fd.noProbate !== 'false';

  const deceasedName = fd.deceasedName || '[DECEASED NAME]';
  const county = fd.countyOfDeath || data.county || '[COUNTY]';
  const witness1Name = fd.witness1Name || '[WITNESS 1 NAME]';
  const witness2Name = fd.witness2Name || '[WITNESS 2 NAME]';

  // ── Drawing helpers ──

  const checkPage = (needed: number = 0.4) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSpace = (amt: number = 0.18) => { y += amt; };

  const addLine = (partial = false) => {
    checkPage(0.3);
    y += 0.08;
    doc.setDrawColor(160, 150, 140);
    doc.line(margin, y, partial ? margin + contentWidth * 0.6 : pageWidth - margin, y);
    y += 0.18;
  };

  const writeLine = (text: string, opts?: {
    size?: number;
    style?: string;
    indent?: number;
    color?: [number, number, number];
    wrap?: boolean;
  }) => {
    const {
      size = 11,
      style = 'normal',
      indent = 0,
      color = [50, 50, 50],
      wrap = true,
    } = opts || {};

    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);

    const x = margin + indent;
    const maxW = contentWidth - indent;

    if (wrap) {
      const lines = doc.splitTextToSize(text, maxW) as string[];
      checkPage(lines.length * (size * 0.0175 + 0.06));
      doc.text(lines, x, y);
      y += lines.length * (size * 0.0175 + 0.06);
    } else {
      checkPage(size * 0.0175 + 0.06);
      doc.text(text, x, y);
      y += size * 0.0175 + 0.06;
    }
  };

  const sectionHeader = (num: string, title: string) => {
    checkPage(0.5);
    addSpace(0.15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 60, 20);
    doc.text(`${num}. ${title.toUpperCase()}`, margin, y);
    y += 0.25;
  };

  const sigLine = (label: string, indent = 0, lineLen = 3) => {
    checkPage(0.45);
    const x = margin + indent;
    doc.setDrawColor(80, 80, 80);
    doc.line(x, y, x + lineLen, y);
    y += 0.08;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, y);
    y += 0.22;
  };

  // ══════════════════════════════════════════════════
  // COVER HEADER
  // ══════════════════════════════════════════════════

  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, pageWidth, 1.4, 'F');

  doc.setTextColor(250, 248, 245);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AFFIDAVIT OF HEIRSHIP', pageWidth / 2, 0.55, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Texas Estates Code § 203.001 et seq.', pageWidth / 2, 0.82, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`State of Texas  |  County of ${county}`, pageWidth / 2, 1.05, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 1.22, { align: 'center' });

  y = 1.7;
  doc.setTextColor(50, 50, 50);

  // ── Opening oath ──
  writeLine(
    `Before me, the undersigned authority, personally appeared ${witness1Name} and ${witness2Name}, ` +
    `known to me to be credible persons, who being duly sworn, upon oath depose and say:`,
    { size: 11, style: 'italic' }
  );

  addSpace(0.15);

  // ══════════════════════════════════════════════════
  // SECTION 1 — PERSONAL KNOWLEDGE
  // ══════════════════════════════════════════════════

  sectionHeader('1', 'Personal Knowledge');

  const lastAddr = [fd.lastAddress, fd.lastCity, fd.lastCounty ? `${fd.lastCounty} County` : '', fd.lastState, fd.lastZip]
    .filter(Boolean).join(', ') || '________________';

  writeLine(
    `Each affiant states that they have personal knowledge of the family history and circumstances of ` +
    `${deceasedName} ("Decedent"), who died on ${fmt(fd.dateOfDeath)} in ${county} County, Texas, ` +
    `having last resided at ${lastAddr}` +
    (fd.residenceFromDate ? ` from ${fmt(fd.residenceFromDate)} until the date of death` : '') +
    `. Decedent was born on ${fmt(fd.deceasedDOB)}.`
  );

  // ══════════════════════════════════════════════════
  // SECTION 2 — MARITAL HISTORY
  // ══════════════════════════════════════════════════

  sectionHeader('2', 'Marital History');

  if (marriages.length === 0 || (marriages.length === 1 && !marriages[0].spouseName)) {
    writeLine('Decedent\'s marital history is as follows: [NO MARRIAGES ENTERED]', { style: 'italic' });
  } else {
    writeLine('Decedent\'s marital history is as follows:');
    addSpace(0.08);
    marriages.forEach((m, i) => {
      const howEndedText = m.howEnded === 'death' ? 'death of spouse'
        : m.howEnded === 'divorce' ? 'divorce'
        : m.howEnded === 'still-married' ? 'decedent survived spouse (still married at time of death)'
        : 'unknown';
      writeLine(
        `  ${i + 1}. Decedent married ${m.spouseName || '[NAME]'} on ${fmt(m.marriageDate)}` +
        (m.howEnded === 'still-married'
          ? `, and this marriage continued until Decedent\'s death.`
          : `. This marriage ended by ${howEndedText}${m.endDate ? ' on ' + fmt(m.endDate) : ''}.`),
        { indent: 0.15 }
      );
      addSpace(0.06);
    });
  }

  // ══════════════════════════════════════════════════
  // SECTION 3 — CHILDREN
  // ══════════════════════════════════════════════════

  sectionHeader('3', 'Children');

  const livingChildren = children.filter(c => c.status === 'living' && c.fullName);
  const deceasedChildren = children.filter(c => c.status === 'deceased' && c.fullName);
  const noChildren = children.filter(c => c.fullName).length === 0;

  if (noChildren) {
    writeLine('Decedent died without children.', { style: 'italic' });
  } else {
    if (livingChildren.length > 0) {
      writeLine('Decedent is survived by the following children:');
      addSpace(0.06);
      livingChildren.forEach((c, i) => {
        writeLine(
          `  ${i + 1}. ${c.fullName}${c.dob ? ', born ' + fmt(c.dob) : ''}` +
          `${c.relation ? ' (' + c.relation + ')' : ''}`,
          { indent: 0.15 }
        );
        addSpace(0.04);
      });
    } else {
      writeLine('Decedent is not survived by any children.');
    }

    addSpace(0.08);

    if (deceasedChildren.length > 0) {
      writeLine('The following children of Decedent predeceased the Decedent:');
      addSpace(0.06);
      deceasedChildren.forEach((c, i) => {
        writeLine(
          `  ${i + 1}. ${c.fullName}${c.dob ? ', born ' + fmt(c.dob) : ''}` +
          `${c.relation ? ' (' + c.relation + ')' : ''}`,
          { indent: 0.15 }
        );
        if (c.grandchildren) {
          addSpace(0.04);
          writeLine(
            `     Issue (grandchildren of Decedent): ${c.grandchildren}`,
            { indent: 0.25, size: 10 }
          );
        }
        addSpace(0.06);
      });
    }
  }

  // ══════════════════════════════════════════════════
  // SECTION 4 — PARENTS
  // ══════════════════════════════════════════════════

  sectionHeader('4', "Parents");

  const fatherStr = fd.fatherName
    ? `${fd.fatherName} (${fd.fatherStatus || 'status unknown'})`
    : '[NOT PROVIDED]';
  const motherStr = fd.motherName
    ? `${fd.motherName} (${fd.motherStatus || 'status unknown'})`
    : '[NOT PROVIDED]';

  writeLine(`Decedent's father was: ${fatherStr}.`);
  addSpace(0.06);
  writeLine(`Decedent's mother was: ${motherStr}.`);

  // ══════════════════════════════════════════════════
  // SECTION 5 — SIBLINGS
  // ══════════════════════════════════════════════════

  sectionHeader('5', 'Siblings');

  if (noSiblings) {
    writeLine('Decedent had no siblings.');
  } else if (siblings.filter(s => s.fullName).length === 0) {
    writeLine('Decedent\'s siblings: [NOT ENTERED]', { style: 'italic' });
  } else {
    writeLine('Decedent\'s siblings are as follows:');
    addSpace(0.06);
    siblings.filter(s => s.fullName).forEach((s, i) => {
      writeLine(
        `  ${i + 1}. ${s.fullName}${s.status ? ' (' + s.status + ')' : ''}`,
        { indent: 0.15 }
      );
      addSpace(0.04);
    });
  }

  // ══════════════════════════════════════════════════
  // SECTION 6 — PROBATE PROCEEDINGS
  // ══════════════════════════════════════════════════

  sectionHeader('6', 'Probate Proceedings');

  if (noProbate) {
    writeLine(
      'No probate proceeding has been filed or is now pending in the State of Texas, or in any other ' +
      'state, with respect to the estate of Decedent.'
    );
  } else {
    writeLine('A probate proceeding has been filed as follows:');
    addSpace(0.06);
    writeLine(fd.probateDescription || '[DESCRIBE PROBATE PROCEEDING]', { indent: 0.15, style: 'italic' });
  }

  // ══════════════════════════════════════════════════
  // SECTION 7 — PROPERTY
  // ══════════════════════════════════════════════════

  sectionHeader('7', 'Property');

  writeLine('This affidavit pertains to the following property:');
  addSpace(0.08);
  writeLine(fd.propertyDescription || '[LEGAL DESCRIPTION OF PROPERTY OR ACCOUNT DESCRIPTION]', { indent: 0.15 });

  // ══════════════════════════════════════════════════
  // SECTION 8 — HEIRSHIP
  // ══════════════════════════════════════════════════

  sectionHeader('8', 'Heirship');

  writeLine(
    `Based on the foregoing and pursuant to Texas Estates Code § 201.001 et seq., the following ` +
    `person(s) are the heirs of Decedent entitled to the Decedent's interest in the above-described property:`
  );
  addSpace(0.12);

  // Build heir table from children (living) and surviving spouse
  const survivingSpouse = marriages.find(m => m.howEnded === 'still-married');
  let heirRows: Array<{ name: string; relationship: string; share: string }> = [];

  if (survivingSpouse?.spouseName) {
    heirRows.push({
      name: survivingSpouse.spouseName,
      relationship: 'Surviving Spouse',
      share: '[_____]',
    });
  }

  livingChildren.forEach(c => {
    heirRows.push({
      name: c.fullName,
      relationship: c.relation === 'adopted' ? 'Adopted Child' : 'Child',
      share: '[_____]',
    });
  });

  deceasedChildren.forEach(c => {
    if (c.grandchildren) {
      c.grandchildren.split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
        heirRows.push({
          name: g,
          relationship: `Grandchild (child of ${c.fullName})`,
          share: '[_____]',
        });
      });
    }
  });

  if (heirRows.length === 0) {
    writeLine('[HEIRS NOT DETERMINABLE FROM ENTERED DATA — COMPLETE MANUALLY]', { style: 'italic' });
  } else {
    // Table header
    const col1 = margin;
    const col2 = margin + 2.5;
    const col3 = margin + 4.8;

    checkPage(0.4);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 60, 20);
    doc.text('Name', col1, y);
    doc.text('Relationship to Decedent', col2, y);
    doc.text('Fractional Share', col3, y);
    y += 0.05;
    doc.setDrawColor(100, 120, 80);
    doc.line(col1, y, pageWidth - margin, y);
    y += 0.15;

    heirRows.forEach(r => {
      checkPage(0.3);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const nameLines = doc.splitTextToSize(r.name, 2.3) as string[];
      const relLines = doc.splitTextToSize(r.relationship, 2.1) as string[];
      const rowH = Math.max(nameLines.length, relLines.length) * 0.18;
      doc.text(nameLines, col1, y);
      doc.text(relLines, col2, y);
      doc.text(r.share, col3, y);
      y += rowH + 0.1;
    });

    addSpace(0.08);
    writeLine(
      'Note: Fractional shares are based on Texas intestacy law (Texas Estates Code § 201.001 et seq.). ' +
      'Complete the share column with legal counsel if needed.',
      { size: 9, style: 'italic' }
    );
  }

  // ══════════════════════════════════════════════════
  // SECTION 9 — DISINTERESTED WITNESSES
  // ══════════════════════════════════════════════════

  sectionHeader('9', 'Disinterested Witnesses');

  writeLine(
    `Each witness states that: (a) they personally knew the Decedent for ` +
    (fd.witness1HowLong || fd.witness2HowLong
      ? `${fd.witness1HowLong || '[__]'} and ${fd.witness2HowLong || '[__]'} respectively`
      : 'a significant period of time') +
    `; (b) they are not an heir, devisee, or creditor of the Decedent, and have no financial interest, ` +
    `direct or indirect, in the outcome of this matter; and (c) all facts stated in this affidavit are ` +
    `true and correct to the best of their knowledge and belief.`
  );

  if (fd.witness1Relationship || fd.witness2Relationship) {
    addSpace(0.08);
    if (fd.witness1Relationship) {
      writeLine(`Witness 1 relationship to Decedent: ${fd.witness1Relationship}`, { size: 10 });
    }
    if (fd.witness2Relationship) {
      writeLine(`Witness 2 relationship to Decedent: ${fd.witness2Relationship}`, { size: 10 });
    }
  }

  // ══════════════════════════════════════════════════
  // ATTESTATION & SIGNATURE BLOCK
  // ══════════════════════════════════════════════════

  checkPage(3.5);
  addSpace(0.3);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('SUBSCRIBED AND SWORN TO', margin, y);
  y += 0.22;
  doc.setFont('helvetica', 'normal');
  doc.text(`before me on this _______ day of _______________, 20___.`, margin, y);
  y += 0.4;

  // Two columns: witness 1 left, witness 2 right
  const leftX = margin;
  const rightX = margin + contentWidth / 2 + 0.1;
  const sigY = y;

  // Witness 1
  doc.setDrawColor(80, 80, 80);
  doc.line(leftX, sigY, leftX + 2.8, sigY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(fd.witness1Name || '[WITNESS 1 NAME]', leftX, sigY + 0.18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (fd.witness1Address) {
    const w1AddrLines = doc.splitTextToSize(fd.witness1Address, 2.8) as string[];
    doc.text(w1AddrLines, leftX, sigY + 0.35);
    y = sigY + 0.35 + w1AddrLines.length * 0.15 + 0.1;
  } else {
    doc.text('[Witness 1 Address]', leftX, sigY + 0.35);
    y = sigY + 0.55;
  }

  // Witness 2
  doc.line(rightX, sigY, rightX + 2.8, sigY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(fd.witness2Name || '[WITNESS 2 NAME]', rightX, sigY + 0.18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (fd.witness2Address) {
    const w2AddrLines = doc.splitTextToSize(fd.witness2Address, 2.8) as string[];
    doc.text(w2AddrLines, rightX, sigY + 0.35);
  } else {
    doc.text('[Witness 2 Address]', rightX, sigY + 0.35);
  }

  addSpace(0.6);

  // Notary blocks (two columns)
  const notaryY = y;

  const notaryText1 = [
    'Notary Public, State of Texas',
    'My commission expires: _______________',
    'Notary ID No.: _______________',
  ];
  const notaryText2 = [...notaryText1];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  let ny = notaryY;
  notaryText1.forEach(t => { doc.text(t, leftX, ny); ny += 0.18; });
  ny = notaryY;
  notaryText2.forEach(t => { doc.text(t, rightX, ny); ny += 0.18; });

  y = notaryY + 0.6;
  addSpace(0.3);

  // ── Preparer note ──
  writeLine(
    'This affidavit was generated by smallestateform.com for informational purposes. This document does not constitute legal advice. ' +
    'Consult a licensed Texas attorney before filing.',
    { size: 8, style: 'italic', color: [120, 110, 100] }
  );

  // ══════════════════════════════════════════════════
  // PAGE 2: BANK / INSTITUTION LETTER
  // ══════════════════════════════════════════════════

  doc.addPage();
  y = margin;

  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, pageWidth, 0.85, 'F');
  doc.setTextColor(250, 248, 245);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BANK / FINANCIAL INSTITUTION INSTRUCTION LETTER', pageWidth / 2, 0.52, { align: 'center' });

  y = 1.1;
  doc.setTextColor(50, 50, 50);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  writeLine(`Date: ${today}`);
  addSpace(0.2);
  writeLine('To Whom It May Concern:', { style: 'bold' });
  addSpace(0.12);
  writeLine(
    `This letter accompanies a legally executed Affidavit of Heirship for the estate of ${deceasedName}, ` +
    `who passed away on ${fmt(fd.dateOfDeath)} in ${county} County, Texas.`
  );
  addSpace(0.12);
  writeLine(bankLetterText['affidavit-of-heirship']);
  addSpace(0.12);
  writeLine(
    'Please process the transfer of the following assets or property to the heir(s) identified in the ' +
    'accompanying affidavit:'
  );
  addSpace(0.08);
  writeLine(fd.propertyDescription || '[See affidavit — property description]', { indent: 0.2, style: 'italic' });
  addSpace(0.18);
  writeLine(
    'A certified copy of the recorded Affidavit of Heirship is attached. Should you require any additional ' +
    'documentation, please contact the affiant directly.'
  );
  addSpace(0.25);
  writeLine('Respectfully,', { style: 'italic' });
  addSpace(0.35);
  sigLine('Affiant / Heir Signature');
  sigLine(fd.witness1Name || 'Printed Name');
  addSpace(0.1);

  writeLine(
    'This letter is provided for convenience. Consult a licensed Texas attorney for legal guidance. ' +
    'Generated by smallestateform.com.',
    { size: 8, style: 'italic', color: [130, 120, 110] }
  );

  return doc;
}

// ─── Original generic generator (unchanged) ──────────────────────────────────

export function generateAffidavitPDF(data: PDFData): jsPDF {
  // Route heirship to the full Texas-compliant generator
  if (data.documentType === 'affidavit-of-heirship') {
    return generateHeirshipAffidavit(data);
  }

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

  addText(`State: ${data.state}${data.county ? ` | County: ${data.county}` : ''}`, margin, 10);
  addSpace(0.05);
  addText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 10);
  addLine();

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
