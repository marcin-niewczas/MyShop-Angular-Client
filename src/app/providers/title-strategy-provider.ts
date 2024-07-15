import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ShopInfo } from '../shared/models/shop-info.class';

export function provideCustomTitleStrategy() {
  return { provide: TitleStrategy, useClass: CustomPageTitleStrategy };
}

@Injectable({ providedIn: 'root' })
class CustomPageTitleStrategy extends TitleStrategy {
  private readonly _title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);

    if (snapshot.url === '/') {
      this._title.setTitle(`${title}`);
      return;
    }

    if (snapshot.url.startsWith('/account')) {
      this._title.setTitle(`${title} | ${ShopInfo.shopName} Account`);
      return;
    }

    if (snapshot.url.startsWith('/management-panel')) {
      this._title.setTitle(`${title} | ${ShopInfo.shopName} Management Panel`);
      return;
    }

    this._title.setTitle(`${title} | ${ShopInfo.shopName}`);
  }
}
