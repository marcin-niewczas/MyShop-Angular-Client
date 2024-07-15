import {
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CategoryMp } from '../../models/category/category-mp.interface';
import { FlatTreeControl } from '@angular/cdk/tree';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, merge, switchMap, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { inOutAnimation } from '../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { GetCategoryMpQueryType } from '../../models/query-types/get-category-mp-query-type.enum';
import { CategoryMpService } from '../../services/category-mp.service';
import { CategoryHelperMpService } from '../category-helper-mp.service';
import { MpMobileCategoryHierarchySidebarComponent } from './mp-mobile-category-hierarchy-sidebar/mp-mobile-category-hierarchy-sidebar.component';

interface CategoryNode {
  expandable: boolean;
  category: CategoryMp;
  level: number;
}

@Component({
  selector: 'app-mp-main-category-hierarchy-tree',
  standalone: true,
  imports: [
    RouterOutlet,
    MatTreeModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    BreadcrumbsComponent,
    RouterLinkActive,
    MatRippleModule,
    MpMobileCategoryHierarchySidebarComponent,
    NgTemplateOutlet,
    NgClass,
  ],
  templateUrl: './mp-main-category-hierarchy-tree.component.html',
  styleUrl: './mp-main-category-hierarchy-tree.component.scss',
  animations: [inOutAnimation],
})
export class MpMainCategoryHierarchyTreeComponent {
  @ViewChild(MpMobileCategoryHierarchySidebarComponent, { static: false })
  mobileCategoryHierarchySidebar?: MpMobileCategoryHierarchySidebarComponent;

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Categories', routerLink: '../' },
  ];

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _categoryHelperMpService = inject(CategoryHelperMpService);
  private readonly _categoryMpService = inject(CategoryMpService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;

  readonly isSidebarOpened = signal(false);

  private _transformer = (node: CategoryMp, level: number) => {
    return {
      expandable: !!node.childCategories && node.childCategories.length > 0,
      category: node,
      level: level,
    };
  };

  readonly treeControl = new FlatTreeControl<CategoryNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private readonly _treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.childCategories,
  );

  get validatorParameters() {
    return this._categoryMpService.validatorParameters;
  }

  readonly dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this._treeFlattener,
  );

  readonly isRefreshRootCategory = signal(false);

  readonly rootCategory = toSignal(
    merge(
      this._activatedRoute.data.pipe(
        map(({ categoryData }) => categoryData as CategoryMp),
      ),
      this._categoryHelperMpService.refreshCategoryTree$.pipe(
        tap(() => this.isRefreshRootCategory.set(true)),
        switchMap(() =>
          this._categoryMpService
            .getById(
              this.dataSource.data[0]?.id!,
              GetCategoryMpQueryType.IncludeLowerCategories,
            )
            .pipe(map((response) => response.data)),
        ),
      ),
    ).pipe(
      map((category) => {
        this.dataSource.data = [category];
        if (this.treeControl.dataNodes.length > 1) {
          this.treeControl.expandAll();
        }

        if (this.breadcrumbsItems.length > 1) {
          this.breadcrumbsItems[1] = { label: category.name };
        } else {
          this.breadcrumbsItems.push({ label: category.name });
        }

        if (this.isRefreshRootCategory()) {
          this.isRefreshRootCategory.set(false);
        }

        return category;
      }),
    ),
  );

  closeSidebar() {
    if (this.mobileCategoryHierarchySidebar) {
      this.mobileCategoryHierarchySidebar.clickedNavItemSubject.next();
    }
  }
}
