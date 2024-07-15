import { CUSTOM_ELEMENTS_SCHEMA, Component, input } from '@angular/core';
import { BasePhoto, PhotoComponent } from '../../photo/photo.component';

@Component({
  selector: 'app-photo-thumbs-gallery',
  standalone: true,
  imports: [PhotoComponent],
  templateUrl: './photo-thumbs-gallery.component.html',
  styleUrl: './photo-thumbs-gallery.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhotoThumbsGalleryComponent {
  readonly photos = input.required<BasePhoto[]>();
}
