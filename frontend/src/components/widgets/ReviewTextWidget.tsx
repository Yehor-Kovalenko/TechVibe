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
    <div className="widget-card flex flex-col h-auto gap-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex justify-between items-center gap-4">
        <p className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap flex-1">
          {previewText}
        </p>

        {text.length > 200 && (
          <button
            onClick={() => setShowFullText(true)}
            className="px-3 py-1 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Read full text
          </button>
        )}
      </div>

      <Modal
        isOpen={showFullText}
        onRequestClose={() => setShowFullText(false)}
        ariaHideApp={false}
        contentLabel="Full Text Review"
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-white/10 shadow-xl max-w-lg w-full mx-4"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4">Full Review Text</h2>
        <div className="max-h-[70vh] overflow-y-auto">
          <p className="whitespace-pre-wrap text-accent-foreground leading-relaxed">
            {text}
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowFullText(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
