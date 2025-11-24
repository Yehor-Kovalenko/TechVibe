export const JobStatus = {
  DOWNLOADED: 'DOWNLOADED',
  TRANSCRIBED: 'TRANSCRIBED',
  DONE: 'DONE',
  FAILED: 'FAILED',
  NO_SPEECH: 'NO_SPEECH',
  CREATED: 'CREATED',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
