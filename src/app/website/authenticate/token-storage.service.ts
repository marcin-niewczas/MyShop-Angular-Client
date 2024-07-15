import { Injectable } from '@angular/core';
import { Auth } from './models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {}

  get accessToken() {
    return localStorage.getItem('access-token');
  }

  get refreshToken() {
    return localStorage.getItem('refresh-token');
  }

  get userTokenId() {
    return localStorage.getItem('user-token-id');
  }

  get expiryAccessTokenDate() {
    const expiryAccessTokenDate = localStorage.getItem(
      'expiry-access-token-date'
    );

    if (!expiryAccessTokenDate) {
      return null;
    }

    return new Date(expiryAccessTokenDate);
  }

  get expiryRefreshTokenDate() {
    const expiryRefreshTokenDate = localStorage.getItem(
      'expiry-refresh-token-date'
    );

    if (!expiryRefreshTokenDate) {
      return null;
    }

    return new Date(expiryRefreshTokenDate);
  }

  saveData(auth: Auth) {
    localStorage.setItem('access-token', auth.accessToken);
    localStorage.setItem(
      'expiry-access-token-date',
      auth.expiryAccessTokenDate.toString()
    );
    localStorage.setItem('refresh-token', auth.refreshToken);
    localStorage.setItem(
      'expiry-refresh-token-date',
      auth.expiryRefreshTokenDate.toString()
    );
    localStorage.setItem('user-token-id', auth.userTokenId);
    localStorage.setItem('user-role', auth.userRole);
  }

  removeData(key: string) {
    localStorage.removeItem(key);
  }

  clearData() {
    localStorage.removeItem('access-token');
    localStorage.removeItem('expiry-access-token-date');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('expiry-refresh-token-date');
    localStorage.removeItem('user-token-id');
    localStorage.removeItem('user-role');
  }
}
