import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { BreakpointObserverService } from './breakpoint-observer.service';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(
    private _toastrService: ToastrService,
    private readonly _breakpointObserverService: BreakpointObserverService
  ) {}

  success(
    message?: string,
    title?: string,
    enableHtml?: boolean,
    timeOut?: number
  ) {
    this.setGlobalConfig();
    this._toastrService.success(
      message,
      title,
      this.setPartialConfig(enableHtml, timeOut)
    );
  }

  info(
    message?: string,
    title?: string,
    enableHtml?: boolean,
    timeOut?: number
  ) {
    this.setGlobalConfig();
    this._toastrService.info(
      message,
      title,
      this.setPartialConfig(enableHtml, timeOut)
    );
  }

  warning(
    message?: string,
    title?: string,
    enableHtml?: boolean,
    timeOut?: number
  ) {
    this.setGlobalConfig();
    this._toastrService.warning(
      message,
      title,
      this.setPartialConfig(enableHtml, timeOut)
    );
  }

  error(
    message?: string,
    title?: string,
    enableHtml?: boolean,
    timeOut?: number
  ) {
    this.setGlobalConfig();
    this._toastrService.error(
      message,
      title,
      this.setPartialConfig(enableHtml, timeOut)
    );
  }

  private setGlobalConfig() {
    this._toastrService.toastrConfig.maxOpened =
      this._breakpointObserverService.isXSmallScreen() ? 1 : 3;
  }

  private setPartialConfig(enableHtml?: boolean, timeOut?: number) {
    const partialConfig: Partial<IndividualConfig<any>> = {};

    if (enableHtml) {
      partialConfig.enableHtml = enableHtml;
    }

    if (timeOut != undefined) {
      partialConfig.timeOut = timeOut;
    }

    if (this._breakpointObserverService.isXSmallScreen()) {
      partialConfig.positionClass = 'toast-mobile';
    }

    return partialConfig;
  }
}
