import query from "../database/index.js";

export async function createMember(members) {
  const newTrip = await query(
    "INSERT INTO members (trip_id, user_id) VALUES ($1, $2) RETURNING *",
    [members.trip_id, members.user_id]
  );
  return newTrip.rows;
}
