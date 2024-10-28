import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@abracodeabra-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
