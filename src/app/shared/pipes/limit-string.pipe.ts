import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitString',
  standalone: true,
})
export class LimitStringPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    maxLength?: number
  ): string | null {
    maxLength = maxLength ?? 32;

    if (!value) {
      return null;
    }

    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }
}
