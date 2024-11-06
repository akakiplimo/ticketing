import { TicketUpdatedEvent } from "@abracodeabra-tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { generateMongooseMockID } from "../../../test/utils";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "Sean Paul",
    price: 1000,
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Sean Da Paul",
    price: 5000,
    userId: generateMongooseMockID(),
  };

  // Create a fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // Return all of this stuff
  return { msg, data, listener, ticket };
};

it("finds, updates and saves a ticket", async () => {
    const { msg, data, listener, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { msg, data, listener } = await setup();

    await listener.onMessage(data, msg); 

    expect(msg.ack).toHaveBeenCalled()
});

it("does not call ack if the event has a skipped version number", async () => {
    const { msg, data, listener, ticket } = await setup();

    data.version = 7;
    
    try {
        await listener.onMessage(data, msg)   
    } catch (error) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled()
})
