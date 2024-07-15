import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(size?: number, currentUnit?: 'KB' | 'MB'): string | null {
    if (!size) {
      return null;
    }

    if (currentUnit) {
      if (currentUnit === 'KB') {
        if (size <= 1) return `${Math.round(size * 1024)} B`;

        if (size >= 1000) return `${Math.round(size / 1048576)} MB`;

        return `${size} KB`;
      }

      return null;
    } else {
      if (size >= 1000000) return `${Math.round(size / 1048576)} MB`;

      if (size >= 1000) return `${Math.round(size / 1024)} KB`;

      return `${Math.round(size)} B`;
    }
  }
}
