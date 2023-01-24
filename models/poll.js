import query from "../database/index.js";

export async function createPoll(poll) {
  const newTrip = await query(
    "INSERT INTO poll (trip_id, category, selected_choice) VALUES ($1, $2, $3) RETURNING *",
    [poll.trip_id, poll.category, poll.selected_choice]
  );
  return newTrip.rows;
}
