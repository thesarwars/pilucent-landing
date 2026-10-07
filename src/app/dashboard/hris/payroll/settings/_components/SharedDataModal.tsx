import React, { useState } from "react";

const SharedDataModal = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const [allowW2Import, setAllowW2Import] = useState(true);
  const [includeVerification, setIncludeVerification] = useState(true);

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving shared data settings:", {
      allowW2Import,
      includeVerification
    });
    setIsOpen(false);
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-900">Shared data</h2>
      </div>

      {/* Content */}
      <div className="space-y-6 mb-8">
        {/* Allow W-2 data import */}
        <div className="flex items-start gap-4">
          <div className="flex items-center mt-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={allowW2Import}
                onChange={(e) => setAllowW2Import(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                  allowW2Import
                    ? 'bg-accent_soft_black border-accent_soft_black'
                    : 'border-gray-300 bg-white'
                }`}
                onClick={() => setAllowW2Import(!allowW2Import)}
              >
                {allowW2Import && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">
                Allow employees to import W-2 data into TurboTax
              </span>
              <span className={`text-gray-700 font-medium ${allowW2Import ? '' : 'text-gray-400'}`}>{allowW2Import ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>

        {/* Include verification service */}
        <div className="flex items-start gap-4">
          <div className="flex items-center mt-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={includeVerification}
                onChange={(e) => setIncludeVerification(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                  includeVerification
                    ? 'bg-accent_soft_black border-accent_soft_black'
                    : 'border-gray-300 bg-white'
                }`}
                onClick={() => setIncludeVerification(!includeVerification)}
              >
                {includeVerification && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-gray-700">
                  Include automated income and employment verification service powered by The Work Number® from Equifax
                </span>
                <div className="mt-1">
                  <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                    Learn more
                  </button>
                </div>
              </div>
              <span className={`text-gray-700 font-medium ml-4 ${includeVerification ? '' : 'text-gray-400'}`}>{includeVerification ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(false)}
          className="px-6 py-2 border-2 border-accent_soft_black text-accent_soft_black rounded font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-2 bg-accent_soft_black text-white rounded hover:bg-green-700 font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SharedDataModal;