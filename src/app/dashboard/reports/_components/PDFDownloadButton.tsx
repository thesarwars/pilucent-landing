import React from "react";

const DownloadButton = ({ pdfUrl, filename, disabled = true }: any) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };

  return (
    <button
      disabled={disabled}
      className="rounded border border-accent_soft_black bg-white px-6 py-2 text-sm font-semibold text-accent_soft_black transition-all duration-300 hover:bg-accent_soft_black hover:text-white active:scale-95"
      onClick={handleDownload}
    >
      Save as PDF
    </button>
  );
};

export default DownloadButton;
