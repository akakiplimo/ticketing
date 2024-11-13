import request from "supertest";
import { OrderStatus } from "@abracodeabra-tickets/common";
import { app } from "../../app";
import { generateMongooseMockID } from "../../test/utils";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// tell jest to use stripe mock
// jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "jaodjoaif",
      orderId: generateMongooseMockID(),
    })
    .expect(404);
});

it("returns a 401 when the user purchasing is different from the one who created the order", async () => {
  const order = Order.build({
    id: generateMongooseMockID(),
    status: OrderStatus.Created,
    version: 0,
    userId: generateMongooseMockID(),
    price: 100,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "qojrifak",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when the user tries to pay for a cancelled order", async () => {
  const userId = generateMongooseMockID();
  const order = Order.build({
    id: generateMongooseMockID(),
    status: OrderStatus.Cancelled,
    version: 0,
    userId,
    price: 200,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "jfifodafjd",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = generateMongooseMockID();
  const price = Math.floor(Math.random() * 1000);
  const order = Order.build({
    id: generateMongooseMockID(),
    status: OrderStatus.Created,
    version: 0,
    userId,
    price,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();

  // Fake implementation, replaced by a more realistic test implementation
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual("tok_visa");
  // expect(chargeOptions.amount).toEqual(100);
  // expect(chargeOptions.currency).toEqual("usd");
});
