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




export async function getUsers(id, body) {

    let userReturn = await query(
        `SELECT * FROM users WHERE users.auth_id = '${id}'` 
    )

    if (userReturn.rows.length === 0){
        userReturn = await query(
            `INSERT INTO users (auth_id, name, email) VALUES ('${body.sub}', '${body.name}', '${body.email}') RETURNING *;` 
        )  
        return {
          newUser: userReturn.rows
        }
    }
    // let userTrips = await query(
    //   `SELECT trip_id FROM trip_users INNER JOIN users ON trip_users.user_id = users.auth_id WHERE users.auth_id = '${body.sub}';`
    // )

    let userData = await query(
      `SELECT trip_id, trip_name, destination, all_joined, all_voted, no_of_users, admin_id FROM trip INNER JOIN trip_users ON trip.id = trip_users.trip_id WHERE trip_users.user_id = '${body.sub}';`
    )

let itinerary = []
for (let i = 0; i < userData.rows.length; i++){
  
  const tripMembers = await query(
    `SELECT name FROM users INNER JOIN trip_users ON users.auth_id = trip_users.user_id WHERE trip_users.trip_id = '${userData.rows[i].trip_id}'`
  )

  let dateChoicesData = await query(
    `SELECT trip_date.id, choice, vote_count, dates.date_id, dates.id, chosen, trip_id FROM trip_date INNER JOIN dates ON trip_date.id = dates.date_id WHERE trip_date.trip_id = '${userData.rows[i].trip_id}'`
  )

    let voteCount = {
      count: 0,
      date_id: 0
    }

    for (let i = 0; i < dateChoicesData.rows.length; i++){
      voteCount.count += dateChoicesData.rows[i].vote_count
      voteCount.date_id = dateChoicesData.rows[i].date_id
    }

  // if (voteCount.count !== userData.rows[i].no_of_users){



  //   console.log(voteCount.count, userData.rows[i].no_of_users)
  //   const updateTripVote = await query(
  //     `UPDATE trip_date SET chosen =  ` //TODO: set to choice with most votes
  //   )
  // }


  userData.rows[i].date_choices = dateChoicesData.rows
  userData.rows[i].total_date_votes = voteCount
  userData.rows[i].members = tripMembers.rows

  let itinerary_voting = await query(
    `SELECT id, trip_id, choice FROM itinerary_voting WHERE itinerary_voting.trip_id = '${userData.rows[i].trip_id}'`
  )
  //userData.rows[i].itinerary_voting = itinerary
  //console.log(itinerary_voting.rows)
  itinerary.push(itinerary_voting.rows)
}

let itinerary_choices = []
for (let i = 0; i < itinerary.length; i++){
  for (let x = 0; x < itinerary[i].length; x++){
    //console.log(itinerary[i][x].id)
      const itineraryOptions = await query(
        `SELECT itinerary_id, itinerary_voting.choice, voting.choice, type, date_time, vote_count FROM voting INNER JOIN itinerary_voting ON voting.itinerary_id = itinerary_voting.id  WHERE itinerary_voting.id = '${itinerary[i][x].id}'`
      )
      //console.log(itineraryOptions.rows)
      itinerary[i][x].voting = itineraryOptions.rows
     // console.log(itinerary[i][x])
  }
  userData.rows[i].itinerary = itinerary[i]
}

//TODO; get the catagories the user has voted on already.. maybe if they're in a seperate part of the return object, we dont need to include them in the queries for further up
//      and we can just filter the results in the trip details page. if the id matches then we know the user has voted..

const dateVotedAlready = await query(
  `SELECT voted_user.vote_id, date_id, trip_id FROM dates INNER JOIN trip_date ON dates.date_id = trip_date.id INNER JOIN voted_user ON dates.id = voted_user.vote_id WHERE voted_user.user_id = '${id}'`
)

const itineraryVotedAlready = await query(
  `SELECT * FROM voted_user INNER JOIN voting ON vote_id = voting.id INNER JOIN itinerary_voting ON itinerary_voting.id = voting.itinerary_id WHERE voted_user.user_id = '${id}'`
 // `SELECT voted_user.vote_id, itinerary_id, trip_id, voting.choice FROM voting INNER JOIN itinerary_voting ON itinerary_id = itinerary_voting.id INNER JOIN voted_user ON vote_id = voting.id WHERE voted_user.user_id = '${id}'`
)
//console.log(itineraryVotedAlready.rows)





//userData.rows[i].trip_id 

    return {
      userData: userReturn.rows,

      fullTripData: userData.rows,

      votesCastByUser: dateVotedAlready.rows,

      itineraryVotesCast: itineraryVotedAlready.rows
    }
}


export async function addTripToUser(id, body) {
//console.log(id)
    const {tripusername, tripid} = body 
    let update
    update = await query(
        `SELECT * FROM trip_users WHERE trip_users.user_id = '${id}' AND trip_users.trip_id = '${tripid}'`
    )
    console.log(update.rows)

     if(update.rows.length < 1){

      update = await query(
          `UPDATE trip_users SET user_id = $1, joined = true, user_name = $2 WHERE trip_id = $3 AND user_name = '${tripusername}' RETURNING *;`,[id, tripusername, tripid]
      )

    }

    //console.log(update.rows)
    return update.rows
}

