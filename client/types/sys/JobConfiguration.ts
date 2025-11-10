export type JobConfiguration = {
  id: number;
  jobName: string; // Required, max length 200
  jobGroup: string; // Required, max length 200, default "DEFAULT"
  jobType: string; // Required, max length 500
  cronExpression: string; // Required, max length 100
  description?: string; // Optional, max length 500
  jobDataJson?: string; // Optional, JSON string of job data
  isActive: boolean; // Default true
};

export type JobScheduleDto = {
  id: number;
  jobType: string;
  jobName: string;
  jobGroup: string;
  cronExpression?: string;
  description?: string;
  nextFireTime?: Date;
  previousFireTime?: Date;
  triggerState: string;
};

export type DetailJobConfigurationDto = {
  id: number;
  jobName: string; // Required, default empty string
  jobGroup: string; // Required, default "DEFAULT"
  jobType: string; // Required, default empty string
  cronExpression: string; // Required
  description?: string; // Optional
  jobDataJson?: string; // Optional
};

// Example of default values
export const defaultJobConfiguration: DetailJobConfigurationDto = {
  id: 0,
  jobName: '',
  jobGroup: 'DEFAULT',
  jobType: '',
  cronExpression: '',
  description: '',
  jobDataJson: '',
};

export interface UpdateJobConfigurationDto {
  id: number;
  cronExpression: string; // Required
  description?: string; // Optional
  jobDataJson?: string; // Optional
}
