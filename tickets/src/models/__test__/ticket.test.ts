import { Ticket } from "../ticket";

it("implements optimistic concurrency control (occ)", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "FFF",
    price: 5,
    userId: "abcd123",
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const ticketFetch1 = await Ticket.findById(ticket.id);
  const ticketFetch2 = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  ticketFetch1!.set({ price: 10 });
  ticketFetch2!.set({ price: 20 });

  // Save the first fetched ticket
  await ticketFetch1!.save();

  // Save the 2nd fetched ticket and expect an error
  try {
    await ticketFetch2!.save();
  } catch (error) {
    return;
  }
});

it("increments the version number on multiple saves", async () => {
    // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "FFF",
    price: 5,
    userId: "abcd123",
  });

  // Save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
})