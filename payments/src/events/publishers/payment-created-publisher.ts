import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@abracodeabra-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
