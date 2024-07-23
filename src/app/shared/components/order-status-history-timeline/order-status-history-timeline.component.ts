import {
  Component,
  OnChanges,
  SimpleChanges,
  input,
  model,
} from '@angular/core';
import { OrderStatusHistory } from '../../models/order/order-status-history.interface';
import { MatIconModule } from '@angular/material/icon';
import { getOrderStatusIcon } from '../../functions/order-status-functions';
import { DatePipe, NgClass } from '@angular/common';
import {
  OrderStatus,
  correctOrderStatusCashOnDeliveryWay,
  correctOrderStatusPaymentWay,
  failedOrderStatus,
  successOrderStatus,
} from '../../models/order/order-status.enum';
import { PaymentMethod } from '../../models/order/payment-method.enum';
import {
  getMatColorClass,
  MatColor,
} from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-order-status-history-timeline',
  standalone: true,
  imports: [MatIconModule, NgClass, DatePipe],
  templateUrl: './order-status-history-timeline.component.html',
  styleUrl: './order-status-history-timeline.component.scss',
})
export class OrderStatusHistoryTimelineComponent implements OnChanges {
  readonly ordersStatusHistories =
    input.required<readonly OrderStatusHistory[]>();
  readonly paymentMethod = input.required<PaymentMethod>();
  readonly color = model<MatColor>('accent');
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');

  readonly getOrderStatusIcon = getOrderStatusIcon;
  readonly getMatColorClass = getMatColorClass;

  readonly restStatusToEnd: OrderStatus[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const orderStatusHistories = changes['ordersStatusHistories']
      ?.currentValue as readonly OrderStatusHistory[];
    const paymentMethod = changes['paymentMethod']
      ?.currentValue as PaymentMethod;

    if (orderStatusHistories || paymentMethod) {
      const currentOrderStatusHistories =
        orderStatusHistories ?? this.ordersStatusHistories();
      const currentPaymentMethod = paymentMethod ?? this.paymentMethod();

      this.restStatusToEnd.splice(0);

      if (currentPaymentMethod === PaymentMethod.CashOnDelivery) {
        correctOrderStatusCashOnDeliveryWay.forEach((status) => {
          if (!currentOrderStatusHistories.some((h) => h.status === status)) {
            this.restStatusToEnd.push(status);
          }
        });
      } else {
        correctOrderStatusPaymentWay.forEach((status) => {
          if (!currentOrderStatusHistories.some((h) => h.status === status)) {
            this.restStatusToEnd.push(status);
          }
        });
      }

      if (currentOrderStatusHistories.length > 0) {
        const last =
          currentOrderStatusHistories[currentOrderStatusHistories.length - 1];

        if (failedOrderStatus.includes(last.status)) {
          this.color.set('warn');
        } else if (successOrderStatus.includes(last.status)) {
          this.color.set('primary');
        }
      }
    }
  }
}
