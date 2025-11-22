import React, { useState } from 'react';
import Modal from 'react-modal';
import type { ReviewTextWidgetConfig } from '../../types/widget.types.ts';

interface ReviewTextWidgetProps {
  config: ReviewTextWidgetConfig;
}

export const ReviewTextWidget: React.FC<ReviewTextWidgetProps> = ({
  config,
}) => {
  const { title, text } = config;
  const [showFullText, setShowFullText] = useState(false);

  Modal.setAppElement?.('#root');

  const displayText = text || "Loading transcript...";
  const previewText = displayText.length > 200
    ? displayText.slice(0, 200).trim() + '…'
    : displayText;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-300 leading-relaxed">
          {previewText}
        </p>
      </div>

      {displayText.length > 200 && displayText !== "Loading transcript..." && (
        <button
          onClick={() => setShowFullText(true)}
          className="px-3 py-1 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors mt-4"
        >
          Read full text
        </button>
      )}

      <Modal
        isOpen={showFullText}
        onRequestClose={() => setShowFullText(false)}
        ariaHideApp={false}
        contentLabel="Full Text Review"
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-white/10 shadow-xl max-w-lg w-full mx-4"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Full Review Text</h2>
        <div className="max-h-96 overflow-y-auto">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
        </div>
        <button
          onClick={() => setShowFullText(false)}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors mt-4"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};
