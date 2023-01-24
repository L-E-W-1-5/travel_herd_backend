import query from "../database/index.js";



export async function castItineraryVote(id, data) {
    //TODO: create the voting for itinerary - find out if a vote has already been cast for this user, save the vote and the user, count the totals, find out if all have voted, if so, send chosen
   // const 
}



export async function castVote(id, data) {
    let returnVoteCount

    returnVoteCount = await query(
        `SELECT vote_count, no_of_users, choice FROM dates INNER JOIN trip_date ON trip_date.id = dates.date_id INNER JOIN trip ON trip_date.trip_id = trip.id WHERE trip_date.trip_id = '${data.trip_id}'`
    )

    const voteReply = await query(
        `SELECT * FROM dates INNER JOIN voted_user ON voted_user.vote_id = dates.id INNER JOIN trip_date ON trip_date.id = dates.date_id WHERE voted_user.user_id = '${id}' AND trip_date.trip_id = '${data.trip_id}'`
    )

    if (voteReply.rows.length >= 1){
        // returnVoteCount = await query(
        //     `SELECT vote_count FROM dates INNER JOIN trip_date ON trip_date.id = dates.date_id WHERE trip_date.trip_id = '${data.trip_id}'`
        // )
        let voteTally = 0
        
        for (let i = 0; i < returnVoteCount.rows.length; i++){
            voteTally += returnVoteCount.rows[i].vote_count
        }

        return {
                message: "you have already voted",
                voteCount: voteTally,
                numberOfUsers: returnVoteCount.rows[0].no_of_users
            }
    }

    let updateDatesTable

    if (voteReply.rows.length < 1){
        const insertVotedUser = await query(
        `INSERT INTO voted_user (vote_id, user_id) VALUES ('${data.id}', '${id}') RETURNING *;`
        )
        console.log(insertVotedUser.rows)
        updateDatesTable = await query(
        `UPDATE dates SET vote_count = '${data.vote_count +1}' WHERE id = ${data.id} RETURNING *;`
        )
        //console.log(updateDatesTable.rows)
    }

    returnVoteCount = await query(
        `SELECT vote_count, no_of_users, choice FROM dates INNER JOIN trip_date ON trip_date.id = dates.date_id INNER JOIN trip ON trip_date.trip_id = trip.id WHERE trip_date.trip_id = '${data.trip_id}'`
    )

    let voteTally = 0

    for (let i = 0; i < returnVoteCount.rows.length; i++){
        voteTally += returnVoteCount.rows[i].vote_count
    }

    if (voteTally === returnVoteCount.rows[0].no_of_users){

        let highVote = {
            number: 0,
            id: 0,
            choice: ""
        }

        for (let i = 0; i < returnVoteCount.rows; i++){
            if (returnVoteCount.rows[i].vote_count > highVote.number){
                highVote.number = returnVoteCount.rows[i].vote_count
                highVote.id = returnVoteCount.rows[i].id
                highVote.choice = returnVoteCount.rows[i].choice
            }
        }

        //console.log(voteTally, returnVoteCount.rows[0].no_of_users)
         const updateTripVote = await query(
           `UPDATE trip_date SET chosen = ${highVote.choice} WHERE trip_date.id = ${returnVoteCount.rows[i].date_id}` //TODO: set to choice with most votes
         )
         return updateTripVote
      }

    console.log("vote count", returnVoteCount.rows)
    console.log(updateDatesTable.rows)
    return {
        updatedTable: updateDatesTable.rows,
        voteCount: voteTally
        }
}

// `UPDATE trip_users SET user_id = $1, joined = true, user_name = $2 WHERE trip_id = $3 RETURNING *;`,[id, tripusername, tripid]