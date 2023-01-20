import query from "../database/index.js";

export async function getTrips(user_id) {
  const allTrips = await query(
    `SELECT trip.trip_name, trip.trip_id FROM members INNER JOIN trip ON trip.trip_id = members.trip_id WHERE members.user_id = ${user_id} RETURNING *`
  );
  return allTrips.rows;
}

export async function createTrip(trip) {
  const newTrip = await query(
    "INSERT INTO trip (trip_name, admin_id) VALUES ($1, $2) RETURNING *",
    [trip.trip_name, trip.admin_id]
  );
  return newTrip.rows;
}


// TODO: create a function that will either get the user and the trips they have joined. or add them to the user database

export async function getUsers(id) {
    let userReturn = await query(
        `SELECT * FROM users WHERE users.auth_id = '${id}'` 
    )
    // if (!userReturn){
    //     let userReturn = await query(
    //         `INSERT INTO users (auth_id, name, email) VALUES ('auth001', 'lewis', 'lewis@lewis.com');`  // TODO: finish this query
    //     )
    // }
    return userReturn.rows
}