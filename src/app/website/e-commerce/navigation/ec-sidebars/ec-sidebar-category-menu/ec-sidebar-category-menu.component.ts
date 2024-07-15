import { Component, inject, model } from '@angular/core';

import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CategoryEcService } from '../../../services/category-ec.service';
import { CategoryEc } from '../../../models/category/category-ec.interface';
import { RouterLink } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  sequence,
} from '@angular/animations';
import {
  slideFromLeftLeaveToLeftAnimation,
  inOutAnimation,
  fadeInOutAnimation,
  inAnimation,
} from '../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { BaseNavCloseSidebar } from '../../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import { SidebarComponent } from '../../../../../shared/components/sidebar/sidebar.component';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-ec-sidebar-category-menu',
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    RouterLink,
    SidebarComponent,
    LoadingComponent,
  ],
  templateUrl: './ec-sidebar-category-menu.component.html',
  styleUrl: './ec-sidebar-category-menu.component.scss',
  animations: [
    slideFromLeftLeaveToLeftAnimation,
    inOutAnimation,
    fadeInOutAnimation,
    inAnimation,
    trigger('fadeTrigger', [
      state('visible', style({})),
      state('invisible', style({})),
      transition(
        'visible <=> invisible',
        sequence([
          animate('0s', style({ opacity: 0 })),
          animate('.2s', style({ opacity: 1 })),
        ]),
      ),
    ]),
  ],
})
export class EcSidebarCategoryMenuComponent extends BaseNavCloseSidebar {
  private readonly _categoryEcService = inject(CategoryEcService);

  readonly breakpointObserverService = inject(BreakpointObserverService);

  animationState = 'visible';

  selectedCategory?: CategoryEc;
  rootCategory?: CategoryEc;
  previousCategory?: CategoryEc;

  readonly categories = this._categoryEcService.categories;

  readonly opened = model.required<boolean>();

  toggleVisibility() {
    this.animationState =
      this.animationState === 'visible' ? 'invisible' : 'visible';
  }

  clickNavItem(category: CategoryEc) {
    if (this._router.url === `/categories/${category.encodedHierarchyName}`) {
      this.opened.set(false);
      return;
    }

    this.clickedNavItemSubject.next();
  }

  fillPreviousCategory() {
    let breakLoop = false;
    this.categories()?.forEach((x) => {
      this.findParentCategoryRecursive(x, breakLoop);

      if (breakLoop) {
        breakLoop = false;
        return;
      }
    });
  }

  private findParentCategoryRecursive(
    category: CategoryEc,
    breakLoop: boolean,
  ) {
    if (!category.childCategories || breakLoop) {
      return;
    }

    if (
      category.childCategories.findIndex(
        (x) => x.id === this.selectedCategory?.id,
      ) !== -1
    ) {
      this.previousCategory = category;
      return;
    }

    category.childCategories.forEach((x) =>
      this.findParentCategoryRecursive(x, breakLoop),
    );
  }
}
