import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
} from '@angular/core';
import { PhotoDefaultCarouselComponent } from './photo-default-carousel/photo-default-carousel.component';
import { PhotoThumbsGalleryComponent } from './photo-thumbs-gallery/photo-thumbs-gallery.component';
import { inAnimation } from '../animations';
import { BasePhoto, PhotoComponent } from '../photo/photo.component';
import { nameof } from '../../functions/helper-functions';

type CarouselType = 'default' | 'galleryThumbs';
@Component({
  selector: 'app-photo-carousel',
  standalone: true,
  imports: [
    PhotoDefaultCarouselComponent,
    PhotoThumbsGalleryComponent,
    PhotoComponent,
  ],
  templateUrl: './photo-carousel.component.html',
  animations: [inAnimation],
})
export class PhotoCarouselComponent implements OnChanges {
  readonly type = input<CarouselType>('default');
  readonly photos = input.required<BasePhoto[]>();

  private readonly _changeDetector = inject(ChangeDetectorRef);

  private _isPhotosChangesProcess = false;

  get isPhotosChangesProcess() {
    return this._isPhotosChangesProcess;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const photosChanges = changes[nameof<PhotoCarouselComponent>('photos')];

    if (
      photosChanges &&
      !photosChanges.firstChange &&
      JSON.stringify(photosChanges.currentValue) !==
        JSON.stringify(photosChanges.previousValue)
    ) {
      this._isPhotosChangesProcess = true;
      this._changeDetector.detectChanges();
      this._isPhotosChangesProcess = false;
    }
  }
}
