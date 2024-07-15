import { NgOptimizedImage } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { toBoolean } from '../../functions/transform-functions';

export type BasePhoto = {
  readonly url?: string;
  readonly alt?: string;
};

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss',
})
export class PhotoComponent {
  readonly photo = input.required<BasePhoto | undefined>();
  readonly width = input('100%');
  readonly height = input('100%');
  readonly minWidth = input('auto');
  readonly minHeight = input('auto');
  readonly maxWidth = input('none');
  readonly maxHeight = input('none');
  readonly loading = input<'eager' | 'lazy'>('eager');
  readonly optimized = input(true, { transform: toBoolean });
  readonly objectFit = input<'contain' | 'cover'>('contain');

  readonly isLoaded = signal(false);
  readonly isError = signal(false);
}
