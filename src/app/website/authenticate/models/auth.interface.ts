export interface Auth {
  accessToken: string;
  expiryAccessTokenDate: Date;
  refreshToken: string;
  expiryRefreshTokenDate: Date;
  userTokenId: string;
  userRole: string;
}
