import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { generateMongooseMockID } from "../../test/utils";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/orders for post requests", async () => {
  const response = await request(app).post("/api/orders").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/orders").send({}).expect(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid ticketId is provided", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: "",
    })
    .expect(400);
});

it("returns error if the ticket does not exist", async () => {
  const ticketId = generateMongooseMockID();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "Family Friends Festival",
    price: 30000,
  });
  await ticket.save();

  const order = Order.build({
    userId: "adfkaljeok",
    status: OrderStatus.Created,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "Family Friends Festival",
    price: 30000,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const orders = await Ticket.find({});
  expect(orders.length).toEqual(1);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: generateMongooseMockID(),
    title: "Family Friends Festival",
    price: 30000,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
