import { UserResponseDto } from '@application/api/controllers/user/dto/user-response-dto';
import { IOrder, PAYMENT_STATUS, SHIPMENT_STATUS } from '@domain/entities/order';
import { convertPrice } from '@src/utils/products';

export class OrderResponseDto {
  id!: string;
  total_price!: number;
  shipment_status!: SHIPMENT_STATUS;
  payment_status!: PAYMENT_STATUS;
  user!: Omit<UserResponseDto, 'hydrate'>;

  public hydrate(order: IOrder) {
    this.id = order._id.toString();
    this.total_price = convertPrice(Number(order.totalPrice));
    this.shipment_status = order.shipmentStatus;
    this.payment_status = order.paymentStatus;
    this.user = {
      id: order.user._id.toString(),
      email: order.user.email,
      locality: order.user.locality,
      first_name: order.user.firstName,
      last_name: order.user.lastName,
    };

    return this;
  }
}
