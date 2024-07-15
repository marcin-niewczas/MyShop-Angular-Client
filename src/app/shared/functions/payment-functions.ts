import {
  faCreditCard,
  faMoneyBill1,
} from '@fortawesome/free-regular-svg-icons';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import {
  faGooglePay,
  faApplePay,
  faPaypal,
} from '@fortawesome/free-brands-svg-icons';
import { PaymentMethod } from '../models/order/payment-method.enum';

export function getPaymentIcon(
  paymentMethod: PaymentMethod | string | null | undefined
) {
  switch (paymentMethod) {
    case PaymentMethod.GooglePay:
      return faGooglePay;
    case PaymentMethod.ApplePay:
      return faApplePay;
    case PaymentMethod.PayPal:
      return faPaypal;
    case PaymentMethod.MyShopPay:
      return faCreditCard;
    case PaymentMethod.CashOnDelivery:
      return faMoneyBill1;
    default:
      return faQuestion;
  }
}
