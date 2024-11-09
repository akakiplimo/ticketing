import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@abracodeabra-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
