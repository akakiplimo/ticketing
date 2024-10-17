import supertest from "supertest";
import { app } from "../../app";
import { generateMongooseMockID } from "../../test/utils";

it("returns a 404 if the provided ticketId does not exist", async () => {
  const id = generateMongooseMockID();
  await supertest(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Walker Town",
      price: 4000,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = generateMongooseMockID();
  await supertest(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Walker Town",
      price: 4000,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await supertest(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "abcs",
      price: 10000,
    });

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "adjkah",
      price: 9000,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await supertest(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "abcs",
      price: 10000,
    });

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 1000,
    })
    .expect(400);

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "afdas",
      price: -100,
    })
    .expect(400);

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      price: 1000,
    })
    .expect(400);

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "dafd",
    })
    .expect(400);
});

it("updates the ticket provided valid input", async () => {
  const cookie = global.signin();
  const response = await supertest(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "abcs",
      price: 10000,
    });

  await supertest(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Coster Ojwang Live",
      price: 20000,
    })
    .expect(200)

    const ticketResponse = await supertest(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()

    expect(ticketResponse.body.title).toEqual("Coster Ojwang Live")
    expect(ticketResponse.body.price).toEqual(20000)
});
