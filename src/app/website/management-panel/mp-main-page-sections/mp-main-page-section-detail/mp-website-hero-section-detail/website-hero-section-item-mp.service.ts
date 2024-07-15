import { Injectable, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class WebsiteHeroSectionItemMpService {
  readonly isLoadActiveWebsiteHeroSectionItems = signal(false);
  readonly isSavePositionsOfActiveItemsProcess = signal(false);
  readonly currentDeactivateId = signal<string | undefined>(undefined);
  readonly currentActiveRemoveId = signal<string | undefined>(undefined);

  readonly isLoadInactiveWebsiteHeroSectionItems = signal(false);
  readonly currentActivateId = signal<string | undefined>(undefined);
  readonly currentInactiveRemoveId = signal<string | undefined>(undefined);

  readonly isProcess = computed(
    () =>
      this.isLoadActiveWebsiteHeroSectionItems() ||
      this.isSavePositionsOfActiveItemsProcess() ||
      this.currentDeactivateId() != undefined ||
      this.currentActiveRemoveId() != undefined ||
      this.isLoadInactiveWebsiteHeroSectionItems() ||
      this.currentActivateId() != undefined ||
      this.currentInactiveRemoveId() != undefined,
  );

  readonly loadInactiveItemsSubject = new Subject<number | undefined>();
  readonly reloadActiveItemsSubject = new Subject<void>();
}
