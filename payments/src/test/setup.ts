import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { generateMongooseMockID } from "./utils";
import dotenv from 'dotenv';

// Load environment variables from .env file (or .env.local if present)
dotenv.config();

// Now you can safely access the STRIPE_TEST_KEY
const stripeTestKey = process.env.STRIPE_TEST_KEY;

if (!stripeTestKey) {
  throw new Error("STRIPE_TEST_KEY is not defined in your .env file");
}

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY = stripeTestKey;

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "jakfjdaofal";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
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

global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || generateMongooseMockID(),
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
