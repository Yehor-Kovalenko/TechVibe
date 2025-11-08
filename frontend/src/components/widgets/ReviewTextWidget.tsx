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

  const previewText = text.length > 50 ? text.slice(0, 50).trim() + '…' : text;

  return (
    <div className="widget-card flex flex-col h-auto">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap mb-4">
        {previewText}
      </p>

      {text.length > 200 && (
        <button
          onClick={() => setShowFullText(true)}
          className="self-end px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Read full text
        </button>
      )}

      <Modal
        isOpen={showFullText}
        onRequestClose={() => setShowFullText(false)}
        ariaHideApp={false}
        contentLabel="Full Review Text"
        className="bg-white rounded-xl shadow-xl p-6 max-w-2xl mx-auto mt-24 outline-none"
        overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4">Full Review Text</h2>
        <div className="max-h-[70vh] overflow-y-auto">
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {text}
          </p>
        </div>
        <button
          onClick={() => setShowFullText(false)}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};
