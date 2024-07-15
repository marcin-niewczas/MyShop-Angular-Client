import { faDhl, faFedex, faUps } from '@fortawesome/free-brands-svg-icons';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { DeliveryMethod } from '../models/order/delivery-method.enum';

export function getDeliveryIcon(
  deliveryMethod?: DeliveryMethod | string | null
) {
  switch (deliveryMethod) {
    case DeliveryMethod.Dhl:
      return faDhl;
    case DeliveryMethod.FedEx:
      return faFedex;
    case DeliveryMethod.Ups:
      return faUps;
    default:
      return faQuestion;
  }
}
