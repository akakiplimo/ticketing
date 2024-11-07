import { OrderCreatedEvent, OrderStatus } from "@abracodeabra-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { generateMongooseMockID } from "../../../test/utils";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: "Fractured Showcase",
    price: 10000,
    userId: generateMongooseMockID(),
  });

  await ticket.save();

  // Create the fake event data
  const data: OrderCreatedEvent["data"] = {
    id: generateMongooseMockID(),
    version: 0,
    status: OrderStatus.Created,
    userId: generateMongooseMockID(),
    expiresAt: "abc123",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Create fake event msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("calls the ack on the msg when successful", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).toEqual(data.id)
})
