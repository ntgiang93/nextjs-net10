export type JobTitleDto = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

export const defaultJobTitleDto: JobTitleDto = {
  id: 0,
  code: '',
  name: '',
  description: '',
};
