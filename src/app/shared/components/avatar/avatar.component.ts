import { Component, OnInit, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { toBoolean } from '../../functions/transform-functions';
import { NgOptimizedImage, SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PhotoComponent } from '../photo/photo.component';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    MatRippleModule,
    SlicePipe,
    NgOptimizedImage,
    MatButtonModule,
    PhotoComponent,
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly firstName = input.required<string>();
  readonly photoUrl = input.required<string | undefined>();
  readonly size = input(35);
  readonly avatarButton = input(false, { transform: toBoolean });
}
