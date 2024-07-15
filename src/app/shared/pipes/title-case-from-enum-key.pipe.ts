import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCaseFromString',
  standalone: true,
})
export class TitleCaseFromStringPipe implements PipeTransform {
  transform(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.replace(/([A-Z])/g, ' $1');
  }
}
