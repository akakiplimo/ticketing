import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from "@abracodeabra-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find a ticket
    const ticket = await Ticket.findById(data.ticket.id);

    // If ticket not found throw an error
    if (!ticket) throw new Error("Ticket does not exist");

    // Unset orderId property
    ticket.set({ orderId: undefined });

    // Save new version of ticket
    await ticket.save();

    // Publish event notifying that the ticket has been updated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    // ack the message
    msg.ack();
  }
}
