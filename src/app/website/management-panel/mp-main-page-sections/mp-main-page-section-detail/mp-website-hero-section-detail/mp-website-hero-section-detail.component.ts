import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { WebsiteHeroSectionMp } from '../../../models/main-page-sections/main-page-section-mp.interface';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MpActiveWebsiteHeroSectionItemsListComponent } from './mp-active-items-list/mp-active-items-list.component';
import { MpInactiveWebsiteHeroSectionItemsListComponent } from './mp-inactive-hero-section-items-list/mp-inactive-hero-section-items-list.component';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-mp-website-hero-section-detail',
  standalone: true,
  imports: [
    MatDividerModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    RouterLink,
    MpActiveWebsiteHeroSectionItemsListComponent,
    MpInactiveWebsiteHeroSectionItemsListComponent,
  ],
  templateUrl: './mp-website-hero-section-detail.component.html',
  styleUrl: './mp-website-hero-section-detail.component.scss',
})
export class MpWebsiteHeroSectionDetailComponent {
  readonly destoryRef = inject(DestroyRef);

  readonly data = input.required<WebsiteHeroSectionMp>();
  readonly remove = output<string>();
  readonly isRemoveProcess = input.required<boolean>();

  readonly inactiveList = viewChild.required(
    MpInactiveWebsiteHeroSectionItemsListComponent,
  );
  readonly activeList = viewChild.required(
    MpActiveWebsiteHeroSectionItemsListComponent,
  );
}
