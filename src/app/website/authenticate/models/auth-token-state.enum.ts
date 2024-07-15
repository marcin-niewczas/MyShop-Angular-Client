export enum AuthTokenState {
  CannotRefresh = 'CannotRefresh',
  NeedRefresh = 'NeedRefresh',
  Ok = 'Ok',
  NoAuthenticate = 'NoAuthenticate',
  RefreshTokenInProgress = 'RefreshTokenInProgress',
}
