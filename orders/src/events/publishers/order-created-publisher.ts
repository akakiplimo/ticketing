import { Publisher, OrderCreatedEvent, Subjects } from "@abracodeabra-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}