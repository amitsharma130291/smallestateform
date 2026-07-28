import { useState } from 'react';
import type { PDFData } from './PDFGenerator';
import { generateAffidavitPDF } from './PDFGenerator';

interface DownloadButtonProps {
  pdfData: PDFData;
  fileName: string;
}

export default function DownloadButton({ pdfData, fileName }: DownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  const handleDownload = async () => {
    setStatus('generating');
    try {
      await new Promise(r => setTimeout(r, 300)); // Brief pause for UX
      const doc = generateAffidavitPDF(pdfData);
      doc.save(`${fileName}.pdf`);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      console.error('PDF generation error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={status === 'generating'}
          className="px-8 py-4 bg-[#2D5016] text-[#F7F4EF] rounded-lg font-medium text-base hover:bg-[#2C2C2A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating your documents...' :
           status === 'done' ? '✓ Download complete — click again for another copy' :
           'Download Free PDF Bundle'}
        </button>
        <span className="px-3 py-1.5 bg-[#EEF4E8] text-[#2D5016] text-xs font-medium rounded border border-[#2D5016]">
          Free During Beta
        </span>
      </div>
      {status === 'done' && (
        <p className="text-[#6B6560] text-sm">Your PDF bundle has been saved. It includes the affidavit, filing date notice, and bank instruction letter.</p>
      )}
      <p className="text-[#6B6560] text-xs text-center max-w-sm">
        No account required. Documents generated locally in your browser — nothing is uploaded to our servers.
      </p>
    </div>
  );
}
