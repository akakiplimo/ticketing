import { OrderCancelledEvent, OrderStatus } from "@abracodeabra-tickets/common";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { generateMongooseMockID } from "../../../test/utils";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: generateMongooseMockID(),
    status: OrderStatus.Created,
    version: 0,
    userId: generateMongooseMockID(),
    price: 1000,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: "afdafda",
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("updates the status of the order", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
