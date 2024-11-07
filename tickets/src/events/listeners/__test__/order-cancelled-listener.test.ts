import { OrderCancelledEvent } from "@abracodeabra-tickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { generateMongooseMockID } from "../../../test/utils";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create a listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create a mock consistent orderId to reuse
  const orderId = generateMongooseMockID();

  // create a ticket
  const ticket = Ticket.build({
    title: "Fractured Showcase",
    price: 10000,
    userId: generateMongooseMockID(),
  });

  ticket.set({ orderId });

  await ticket.save();

  // create a test event
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // create a test message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return everything
  return { listener, ticket, data, msg, orderId };
};

it("Un-sets the orderId of the ticket", async () => {
  // call the setup
  const { listener, ticket, data, msg } = await setup();

  // call on message on the listener
  await listener.onMessage(data, msg);

  // find the updated ticket
  const updatedTicket = await Ticket.findById(ticket.id);

  // expect orderId value of the ticket to be undefined
  expect(updatedTicket?.orderId).toBeUndefined();
});

it("acks the message when successful", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("Publishes the ticket update event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData?.orderId).toBeUndefined();
});
