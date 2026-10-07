import { toast } from '@/lib/ToastService';
import React, { useState } from 'react';
import PDFModal from './PDFModal';
import DownloadButton from './PDFDownloadButton';
import Link from 'next/link';
import MainLoader from '@/components/MainLoader/MainLoader';
import { deleteAttachment } from '@/app/helpers/backend';
import { getRelativePath } from '@/app/helpers/crypto';

const BaseURL = 'https://balanzifyapi.jumatechs.xyz';

const PrintPDF = ({ fetchFn, title = 'Report' }: { fetchFn: any; title?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [PDF, setPDF] = useState<any>({});
  const [isPDFLoading, setIsPDFLoading] = useState(false);

  const handlePrintReport = async () => {
    setIsOpen(true);
    try {
      setPDF({});
      setIsPDFLoading(true);
      const res = await fetchFn({ is_pdf: true });
      if (res?.url) {
        setPDF(res);
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsPDFLoading(false);
    }
  };

  const handleClose = async () => {
    setIsOpen(false);

    try {
      const res = await deleteAttachment(PDF?.file_uid);
    } catch (error) {
      //error here
    } finally {
      setPDF({});
    }
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handlePrintReport}
        className="rounded-[10px] border border-accent_soft_black bg-transparent px-6 py-2 text-sm font-semibold text-accent_soft_black transition-all duration-300 hover:bg-accent_soft_black hover:text-white active:scale-95"
      >
        Print
      </button>
      <PDFModal isOpen={isOpen} onClose={() => handleClose()} title={title}>
        <div className="mt-2 grid grid-cols-8 font-lexend md:gap-16">
          <div className="col-span-8 lg:col-span-3">
            <h1 className="mb-4 font-lexend text-2xl font-semibold">Print or save as PDF</h1>
            <p>
              To print, right-the preview and select Print. Or, click the Print icon if you see one
              below.
            </p>
            <div className="mt-12 flex items-center gap-8">
              <DownloadButton
                disabled={isPDFLoading}
                pdfUrl={PDF?.url || ''}
                filename={PDF?.url || 'report.pdf'}
              />
              <Link
                target="_blank"
                href={'/view?href=' + getRelativePath(PDF?.url) || ''}
                className="flex items-center gap-1 rounded border border-accent_soft_black bg-accent_soft_black px-12 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-accent_soft_black active:scale-95"
              >
                Print
              </Link>
            </div>
          </div>
          <div className="col-span-8 h-full max-w-full max-md:mt-8 lg:col-span-5">
            {isPDFLoading ? (
              <MainLoader color="#16151c" />
            ) : (
              PDF?.url && (
                <iframe
                  title="Profit Loss Report"
                  loading="lazy"
                  src={PDF?.url || ''}
                  className="h-[90vh] w-full"
                />
              )
            )}
          </div>
        </div>
      </PDFModal>
    </div>
  );
};

export default PrintPDF;
