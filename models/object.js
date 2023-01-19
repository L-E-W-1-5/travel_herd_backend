import query from "../database/index.js";

export async function getTrips(user_id) {
  const allTrips = await query(
    `SELECT trip.trip_name, trip.trip_id FROM members INNER JOIN trip ON trip.trip_id = members.trip_id WHERE members.user_id = ${user_id} RETURNING *`
  );
  return allTrips.rows;
}

export async function createTrip(trip) {

    let member_count = trip.member.length    

    const groupAndDestinationTable = await query(
        `INSERT INTO trip (trip_name, destination, admin_id, no_of_users, all_joined, all_voted) VALUES ('${trip.group}', '${trip.destination}', '${trip.admin}', '${member_count}', false, false) RETURNING *`
    );
    const dateTable = await query(
        `INSERT INTO trip_date (trip_id, chosen) VALUES ('${groupAndDestinationTable.rows[0].id}', NULL) RETURNING *;`
    )
    let dateChoices = []
   
    for (let i = 0; i < trip.date.length; i++){
        let dateChoice = await query(
            `INSERT INTO dates (date_id, choice, vote_count) VALUES ('${dateTable.rows[0].id}', 'from: ${trip.date[i].from} to: ${trip.date[i].to}', '0') RETURNING *;`
        );
        dateChoices.push(dateChoice.rows)
   }

     let itineraryChoices = []
     let rowsIti = []

    for (let i = 0; i < trip.event.length; i++){
        let itiChoice = await query(
            `INSERT INTO itinerary_voting (trip_id, choice) VALUES ('${groupAndDestinationTable.rows[0].id}', NULL) RETURNING *;`
        )
        itineraryChoices.push(itiChoice.rows[0])

        for (let x = 0; x < trip.event[i].itinerary.length; x++){
            let itiChoice = await query(
                `INSERT INTO voting (itinerary_id, choice, type, date_time, vote_count) VALUES ('${itineraryChoices[i].id}', '${trip.event[i].itinerary[x].name}', '${trip.event[i].itinerary[x].type}', '${trip.event[i].itinerary[x].date_time}', '0' ) RETURNING *;`
            )
            console.log(itiChoice.rows)
                console.log("test 4")
                rowsIti.push(itiChoice.rows[0])
        }
    }

  return {
            group: groupAndDestinationTable.rows,
            dates: dateTable.rows,
            date_choices: dateChoices,
            itinerary: rowsIti,
            itinerary_choices: itineraryChoices
        };
}
