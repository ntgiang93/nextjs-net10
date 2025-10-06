export type UserProfileDto = {
  id: number;
  userId: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
};

export const defaultUserProfileDto: UserProfileDto = {
  id: 0,
  userId: '0',
  address: '',
  dateOfBirth: '',
  gender: '',
};
