import { Component, Input, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toBoolean } from '../../functions/transform-functions';
import {
  getMatColorClass,
  MatColor,
} from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Input() diameter: number = 100;
  @Input({ transform: toBoolean }) buttonLoader = false;
  @Input({ transform: toBoolean }) center = false;
  @Input() color: MatColor = 'primary';
  @Input() progressValue?: number;
  readonly iconLoader = input(false, { transform: toBoolean });

  readonly getMatColorClass = getMatColorClass;

  ngOnInit(): void {
    if (this.buttonLoader) {
      this.diameter = 22;
      this.color = 'accent';
    }

    if (this.progressValue || this.progressValue === 0) {
      this.center = true;
    }

    if (this.iconLoader()) {
      this.diameter = 24;
    }
  }
}
