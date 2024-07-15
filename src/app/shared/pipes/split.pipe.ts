import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
  standalone: true,
})
export class SplitPipe implements PipeTransform {
  transform(
    value: string | undefined | null,
    index: number,
    separator?: string
  ): string | null {
    if (value == undefined) {
      return null;
    }

    if (!separator) {
      separator = ' ';
    }

    const splittedValue = value.split(' ');

    return splittedValue.length < index
      ? splittedValue[splittedValue.length - 1]
      : splittedValue[index];
  }
}
