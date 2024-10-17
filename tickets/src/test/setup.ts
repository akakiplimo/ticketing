import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { generateMongooseMockID } from "./utils";

declare global {
  var signin: () => string[];
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "jakfjdaofal";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: generateMongooseMockID(),
    email: "test@test.com",
  };

  // Create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build a session Object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = btoa(sessionJSON);

  // return a string thats the cookie with encoded data
  return [`session=${base64}`];
};
