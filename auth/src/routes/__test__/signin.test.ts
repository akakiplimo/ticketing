import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exist is given", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(400);
});

it("fails when an incorrect password is given", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@tes.com",
      password: "tastless",
    })
    .expect(400);
});

it("succeeds when a correct email & password match is given", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(200);
});

it("responds with a cookie when given a valid credential", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@tes.com",
      password: "tasty",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
