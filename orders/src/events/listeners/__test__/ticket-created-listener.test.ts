import { TicketCreatedEvent } from "@abracodeabra-tickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { generateMongooseMockID } from "../../../test/utils";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data object (event data)
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: generateMongooseMockID(),
    title: "Tarrus Riley",
    price: 3000,
    userId: generateMongooseMockID(),
  };

  // create a fake message object}
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
});
