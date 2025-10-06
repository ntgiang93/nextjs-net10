export type LoginDto = {
  username: string;
  password: string;
  deviceId: string;
  deviceToken?: string;
};

export const defaultLogin: LoginDto = {
  username: '',
  password: '',
  deviceId: '',
};

export type TokenDto = {
  accessToken: string;
  refreshToken: string;
  expiration: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
  device: string;
  ipAddress?: string;
};

export const defaultRefreshToken: RefreshTokenDto = {
  refreshToken: '',
  device: '',
  ipAddress: undefined,
};
