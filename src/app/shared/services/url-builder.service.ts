import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UrlBuilderService {

  buildUrl<T extends {[key:string]: any}>(baseUrl: string, queryParams: T) {
    const keys = Object.keys(queryParams);
    let queryParamsString = '';
    let value;

    keys.forEach((key) => {
      value = queryParams[key];
      if (value == undefined) {
        return;
      }

      if (queryParamsString.length <= 0) {
        queryParamsString += `?${key}=${value}`;
      } else {
        queryParamsString += `&${key}=${value}`;
      }
    });

    return baseUrl + queryParamsString;
  }
}