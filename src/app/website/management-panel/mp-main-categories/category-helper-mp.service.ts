import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class CategoryHelperMpService {
  private refreshTreeCategorySubject: Subject<void> = new Subject<void>();
  refreshCategoryTree$ = this.refreshTreeCategorySubject.asObservable();

  emitRefreshTreeCategory() {
    this.refreshTreeCategorySubject.next();
  }
}
