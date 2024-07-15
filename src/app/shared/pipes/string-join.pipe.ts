import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringJoin',
  standalone: true,
})
export class StringJoinPipe implements PipeTransform {
  transform(
    values: string[] | undefined | null,
    separator?: string,
    take?: number
  ): string | null | undefined {
    if (!values || values.length <= 0) {
      return null;
    }

    separator = separator && separator.length >= 1 ? separator : ', ';

    if (take) {
      if (take < values.length) {
        return `${values.slice(0, take).join(separator)}${separator} ...`;
      }

      return values.slice(0, take).join(separator);
    }

    return values.join(separator);
  }
}
