import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: "FFF",
    price: 90000,
  });
  await ticket.save();

  const user = global.signin();
  // Make request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if malicious user tries to get the order of another user", async () => {
  // Create a ticket
  const ticket = Ticket.build({
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

  // Make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .send()
    .expect(401);
});
