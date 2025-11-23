export const JobStatus = {
  DOWNLOADED: 'DOWNLOADED',
  TRANSCRIBED: 'TRANSCRIBED',
  DONE: 'DONE',
  FAILED: 'FAILED'
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
