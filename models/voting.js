import query from "../database/index.js";
import { neonConnection } from "../database/index.js";



export async function castItineraryVote(id, data) {
    console.log(id, data)
    //TODO: create the voting for itinerary - find out if a vote has already been cast for this user, save the vote and the user, count the totals, find out if all have voted, if so, send chosen
    let returnVoteCount = await neonConnection.query(  
        `SELECT * 
        FROM voting 
        INNER JOIN voted_user 
        ON voted_user.vote_id = voting.itinerary_id 
        WHERE voted_user.vote_id = '${data.itinerary_id}' 
        AND voted_user.user_id = '${id}'
        AND voted_user.type_of_vote = 'itinerary'`
    )

//    console.log("first", returnVoteCount.rows);

    let voteReply = await neonConnection.query(
        `SELECT vote_count, no_of_users, voting.id, voting.itinerary_id, itinerary_voting.choice, voting.choice, date_time, type 
        FROM voting 
        INNER JOIN itinerary_voting 
        ON voting.itinerary_id = itinerary_voting.id 
        INNER JOIN trip 
        ON itinerary_voting.trip_id = trip.id 
        WHERE voting.itinerary_id = '${data.itinerary_id}'`
    )
    
 //   console.log(voteReply.rows)

    let voteTally = 0

    if (returnVoteCount.length >= 1){  

        for (let i = 0; i < returnVoteCount.length; i++){
            voteTally += returnVoteCount[i].vote_count
        }

        return {
            message: "you have already voted",
            vote_count: voteTally,
            number_of_users: voteReply[0].no_of_users
        }
    }

   let updateItineraryItemVote;

    if (returnVoteCount.length < 1){
        const addVote = await neonConnection.query(
            `INSERT INTO voted_user (vote_id, user_id, type_of_vote) VALUES ('${data.id}', '${id}', 'itinerary') RETURNING *;`
        )
        console.log("42", data.itinerary_id, data.id)

        updateItineraryItemVote = await neonConnection.query(
            `UPDATE voting 
            SET vote_count = '${data.vote_count +1}' 
            WHERE id = ${data.id} 
            AND itinerary_id = ${data.itinerary_id} 
            RETURNING *;`
        )
    //    console.log(updateItineraryItemVote.rows)
    }

    voteReply = await neonConnection.query(
        `SELECT vote_count, no_of_users, voting.id, voting.itinerary_id, itinerary_voting.choice, date_time, type 
        FROM voting 
        INNER JOIN itinerary_voting 
        ON voting.itinerary_id = itinerary_voting.id 
        INNER JOIN trip 
        ON itinerary_voting.trip_id = trip.id 
        WHERE voting.itinerary_id = '${data.itinerary_id}'`
    )

    voteTally = 0

    for (let i = 0; i < voteReply.length; i++){
        voteTally += voteReply[i].vote_count
    }
//console.log(voteTally, voteReply.rows)
        //TODO: finish off the voting functionality for the itinerary - if the number of votes equals the number of members, update the choice in itinerary_voting

        if (voteTally === voteReply[0].no_of_users && voteReply[0].choice === null){

            let highVote = {
                number: 0,
                id: 0,
                choice: ""
            }

            for (let i = 0; i < voteReply.length; i++){
                if (voteReply[i].vote_count > highVote.number){
                    highVote.number = voteReply[i].vote_count
                    highVote.id = voteReply[i].id  //TODO: change the id to a INT in the database
                    highVote.choice = voteReply[i].choice     
                }
            }

            const updateTripVote = await neonConnection.query(
                `UPDATE itinerary_voting SET choice = ${highVote.id} WHERE itinerary_voting.id = ${data.itinerary_id}` //TODO: set to choice with most votes. WHERE to join
            )

        }


    // returnVoteCount = await query(
    //     `SELECT itinerary_voting.id, itinerary_voting.trip_id, voting.id, voting.vote_count, voting.choice FROM itinerary_voting INNER JOIN voting ON itinerary_voting.id = voting.itinerary_id INNER JOIN voted_user ON voted_user.vote_id = voting.id 
    //     WHERE voted_user.user_id = '${id}' AND itinerary_voting.id = '${data.itinerary_id}'`    
    // )
    return {
        return_vote_info: voteReply,
        vote_count: voteTally,
        //updated: updateItineraryItemVote.rows
    }
}



export async function castVote(id, data) {
    let returnVoteCount;

    returnVoteCount = await neonConnection.query(
        `SELECT vote_count, no_of_users, choice 
        FROM dates 
        INNER JOIN trip_date 
        ON trip_date.id = dates.date_id 
        INNER JOIN trip 
        ON trip_date.trip_id = trip.id 
        WHERE trip_date.trip_id = '${data.trip_id}'`
    )

    const voteReply = await neonConnection.query(
        `SELECT * 
        FROM dates 
        INNER JOIN voted_user 
        ON voted_user.vote_id = dates.id 
        INNER JOIN trip_date 
        ON trip_date.id = dates.date_id 
        WHERE voted_user.user_id = '${id}' 
        AND trip_date.trip_id = '${data.trip_id}'
        AND voted_user.type_of_vote = 'date'`
    )

    if (voteReply.rows.length >= 1){
        // returnVoteCount = await query(
        //     `SELECT vote_count FROM dates INNER JOIN trip_date ON trip_date.id = dates.date_id WHERE trip_date.trip_id = '${data.trip_id}'`
        // )
        let voteTally = 0
        
        for (let i = 0; i < returnVoteCount.length; i++){
            voteTally += returnVoteCount[i].vote_count
        }

        return {
                message: "you have already voted",
                voteCount: voteTally,
                numberOfUsers: returnVoteCount.rows[0].no_of_users
            }
    }

    let updateDatesTable;

    if (voteReply.rows.length < 1){
        const insertVotedUser = await neonConnection.query(
        `INSERT INTO voted_user (vote_id, user_id, type_of_vote) VALUES ('${data.id}', '${id}', 'date') RETURNING *;`
        )
        console.log(insertVotedUser.rows)
        updateDatesTable = await neonConnection.query(
        `UPDATE dates SET vote_count = '${data.vote_count +1}' WHERE id = ${data.id} RETURNING *;`
        )
        //console.log(updateDatesTable.rows)
    }

    returnVoteCount = await neonConnection.query(
        `SELECT vote_count, no_of_users, choice FROM dates INNER JOIN trip_date ON trip_date.id = dates.date_id INNER JOIN trip ON trip_date.trip_id = trip.id WHERE trip_date.trip_id = '${data.trip_id}'`
    )

    let voteTally = 0

    for (let i = 0; i < returnVoteCount.length; i++){
        voteTally += returnVoteCount[i].vote_count
    }

    if (voteTally === returnVoteCount[0].no_of_users){

        let highVote = {
            number: 0,
            id: 0,
            choice: ""
        }

        for (let i = 0; i < returnVoteCount.length; i++){
            if (returnVoteCount[i].vote_count > highVote.number){
                highVote.number = returnVoteCount[i].vote_count
                highVote.id = returnVoteCount[i].id
                highVote.choice = returnVoteCount[i].choice
            }
        }

        //console.log(voteTally, returnVoteCount.rows[0].no_of_users)
         const updateTripVote = await neonConnection.query(
           `UPDATE trip_date SET chosen = ${highVote.choice} WHERE trip_date.id = ${data.id}` //TODO: set to choice with most votes
         )
         return updateTripVote
      }

   // console.log("vote count", returnVoteCount.rows)
    //console.log(updateDatesTable.rows)
    return {
        updatedTable: updateDatesTable,
        voteCount: voteTally
        }
}

// `UPDATE trip_users SET user_id = $1, joined = true, user_name = $2 WHERE trip_id = $3 RETURNING *;`,[id, tripusername, tripid]