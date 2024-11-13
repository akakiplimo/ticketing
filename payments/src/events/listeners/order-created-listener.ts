import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@abracodeabra-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      version: data.version,
      userId: data.userId,
      status: data.status,
    });

    await order.save();

    msg.ack();
  }
}
