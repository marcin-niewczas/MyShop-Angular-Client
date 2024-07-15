import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'enumValue', standalone: true })
export class EnumValuePipe implements PipeTransform {
  transform<TType>(input: string, enumType: TType): TType | null {
    const value = Object(enumType)[input];
    if (value) {
      return value;
    }

    throw Error('Cannot get value. Propably wrong enumType.');
  }
}
