import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  const data = JSON.stringify({
    id: "5368",
    title: "Sean Paul",
    price: "5000",
  });

  stan.publish("ticket:created", data, () => {
    console.log("Event Published!");
  });
});
