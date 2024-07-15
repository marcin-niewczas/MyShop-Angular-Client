import { Injectable } from '@angular/core';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
} from '@angular/platform-browser';

declare const Hammer: any;

@Injectable()
class CustomHammerJSConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

export function provideHammerJSConfig() {
  return { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerJSConfig };
}
