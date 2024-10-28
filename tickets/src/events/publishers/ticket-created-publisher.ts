import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@abracodeabra-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}