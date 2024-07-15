import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, input, model } from '@angular/core';
import { BaseNavCloseSidebar } from '../../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import { SidebarComponent } from '../../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-mp-mobile-category-hierarchy-sidebar',
  standalone: true,
  imports: [SidebarComponent, NgTemplateOutlet],
  templateUrl: './mp-mobile-category-hierarchy-sidebar.component.html',
})
export class MpMobileCategoryHierarchySidebarComponent extends BaseNavCloseSidebar {
  override readonly opened = model.required<boolean>();
  readonly categoryTreeTemplate = input.required<TemplateRef<any>>();
}
