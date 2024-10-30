import { Publisher, OrderCancelledEvent, Subjects } from "@abracodeabra-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}