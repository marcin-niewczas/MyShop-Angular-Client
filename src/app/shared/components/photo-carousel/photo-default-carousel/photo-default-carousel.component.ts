import { CUSTOM_ELEMENTS_SCHEMA, Component, input } from '@angular/core';
import { BasePhoto, PhotoComponent } from '../../photo/photo.component';

@Component({
  selector: 'app-photo-default-carousel',
  standalone: true,
  imports: [PhotoComponent],
  templateUrl: './photo-default-carousel.component.html',
  styleUrl: './photo-default-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhotoDefaultCarouselComponent {
  readonly photos = input.required<BasePhoto[]>();
}
