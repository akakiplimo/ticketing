import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@abracodeabra-tickets/common";
import { createChargeRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    // no need to sign cookie as it will bring problems with microservice arch
    // & jwt is inherently secure as signature can be verified
    signed: false,
    // only allow https (secure connections)
    secure: false,
  })
);
app.use(currentUser);

app.use(createChargeRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
