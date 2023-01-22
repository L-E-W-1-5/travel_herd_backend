import query from "../database/index.js";

export async function castVote(id, data) {
    const voteReply = await query(
        `SELECT * FROM dates INNER JOIN voted_user ON voted_user.vote_id = dates.id INNER JOIN trip_date ON trip_date.id = dates.date_id WHERE voted_user.user_id = '${id}' AND trip_date.trip_id = '${data.trip_id}'`
    )
    console.log(voteReply.rows)
    if (voteReply.rows.length >= 1){
        return "you have already voted"
    }
let updateDatesTable
    console.log(voteReply.rows)
    if (voteReply.rows.length < 1){
        const insertVotedUser = await query(
        `INSERT INTO voted_user (vote_id, user_id) VALUES ('${data.id}', '${id}')`
        )
        console.log(insertVotedUser.rows)
        updateDatesTable = await query(
        `UPDATE dates SET vote_count = '${data.vote_count +1}' WHERE id = ${data.id} RETURNING *;`
        )
        console.log(updateDatesTable.rows)
    }
    return updateDatesTable.rows
}

// `UPDATE trip_users SET user_id = $1, joined = true, user_name = $2 WHERE trip_id = $3 RETURNING *;`,[id, tripusername, tripid]