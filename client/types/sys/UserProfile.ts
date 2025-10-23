export type UserProfileDto = {
  id: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitleId?: number;
  departmentId?: number;
  departmentName?: string;
};

export const defaultUserProfileDto: UserProfileDto = {
  id: '',
  address: '',
  dateOfBirth: '',
  gender: '',
  jobTitleId: 0,
  departmentId: 0,
};
