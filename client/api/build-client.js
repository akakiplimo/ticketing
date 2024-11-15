import axios from "axios";

export default function buildClient({ req }) {
  if (typeof window === "undefined") {
    // we are on the server

    return axios.create({
      baseURL: "http://www.mytkt.online/",
      headers: req.headers,
    });
  } else {
    // we are on the browser

    return axios.create({
      baseURL: "/",
    });
  }
}
