import React, { useState } from 'react';
import Modal from 'react-modal';
import { checkJobStatus } from './fetchApiUrl';
import { JobStatus } from '../config/JobStatus';
import { useJobs } from './hooks/useJobs.ts';
import { useJob } from './hooks/useJob.ts';
import { useView } from './hooks/useView.ts';

Modal.setAppElement('#root');

export const PreviousJobsModal: React.FC = () => {
  const { setJobId } = useJob();
  const { setView } = useView();
  const { jobs } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJobSelect = (jobId: string) => {
    setJobId(jobId);
    checkJobStatus(jobId)
      .then((response) => {
        if (response.status !== JobStatus.DONE) {
          setView('loading');
        } else {
          setView('dashboard');
        }
      })
      .catch((error) => {
        console.log('Error checking job status:', error);
        setView('landing');
      });

    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 border"
      >
        View Previous Jobs
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto outline-none"
        overlayClassName="fixed inset-0 bg-black/50 grid place-items-center z-50"
        contentLabel="Previous Jobs"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Previous Jobs</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No previous jobs found
            </p>
          ) : (
            jobs.map((jobId, index) => (
              <button
                key={jobId}
                onClick={() => handleJobSelect(jobId)}
                className="w-full px-4 py-3 text-left rounded-md bg-secondary hover:bg-secondary/80 border transition-colors"
              >
                Job #{index + 1}: {jobId}
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
