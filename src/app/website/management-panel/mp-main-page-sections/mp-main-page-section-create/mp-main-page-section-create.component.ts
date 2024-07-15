import { KeyValuePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MpWebsiteProductsCarouselSectionCreateFormComponent } from './mp-website-products-carousel-section-create-form/mp-website-products-carousel-section-create-form.component';
import { MpWebsiteHeroSectionCreateFormComponent } from './mp-website-hero-section-create-form/mp-website-hero-section-create-form.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { MainPageSectionType } from '../../../../shared/models/main-page-section/main-page-section-type.enum';

@Component({
  selector: 'app-mp-main-page-section-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatRadioModule,
    KeyValuePipe,
    MatSelectModule,
    FormsModule,
    MpWebsiteProductsCarouselSectionCreateFormComponent,
    MpWebsiteHeroSectionCreateFormComponent,
  ],
  templateUrl: './mp-main-page-section-create.component.html',
  styleUrl: './mp-main-page-section-create.component.scss',
})
export class MpMainPageSectionCreateComponent {
  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Page Sections', routerLink: '../' },
    { label: 'Create Main Page Section' },
  ];

  readonly MainPageSectionType = MainPageSectionType;
  readonly selectedMainPageSectionType = signal(
    MainPageSectionType.WebsiteHeroSection,
  );

  readonly isCreateProcess = signal(false);
}
