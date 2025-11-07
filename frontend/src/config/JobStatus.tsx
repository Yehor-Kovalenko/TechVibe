export const JobStatus = {
  DOWNLOADED: "DOWNLOADED",
  TRANSCRIBED: "TRANSCRIBED",
  DONE: "DONE"
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];