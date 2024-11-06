import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { generateMongooseMockID } from "../../test/utils";

it("returns an error if malicious user tries to cancel the order of another user", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "FFF",
    price: 90000,
  });
  await ticket.save();

  const user1 = global.signin();
  const user2 = global.signin();
  // Make request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to cancel the order through another user
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .send()
    .expect(401);
});

it("successfully marks an order as cancelled", async () => {
  //  create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "FFF",
    price: 50000,
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // Expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
});

it("emits an order cancelled event when successful", async () => {
  //  create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "FFF",
    price: 50000,
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
