import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BreadcrumbsItems } from './breadcrumbs.interface';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
})
export class BreadcrumbsComponent {
  readonly breadcrumbsItems = input.required<BreadcrumbsItems>();
}
