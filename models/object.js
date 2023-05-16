import query from "../database/index.js";
import nodemailer from 'nodemailer'

const email = 'SOCtravelherd@gmail.com'
const password = 'zswojfnerfeyktvz'


export async function getTrips(user_id) {
  const allTrips = await query(
    `SELECT trip.trip_name, trip.trip_id FROM members INNER JOIN trip ON trip.trip_id = members.trip_id WHERE members.user_id = ${user_id} RETURNING *`
  );
  return allTrips.rows;
}

export async function createTrip(trip) {

    let member_count = trip.member.length + 1  

    const groupAndDestinationTable = await query(
        `INSERT INTO trip (trip_name, destination, admin_id, no_of_users, all_joined, all_voted) VALUES ('${trip.group}', '${trip.destination}', '${trip.admin_id}', '${member_count}', false, false) RETURNING *`
    );

    if (trip.date.length === 1){
        `INSERT INTO trip_date (trip_id, chosen) VALUES ('${groupAndDestinationTable.rows[0].id}', 'from: ${trip.date[0].from} to: ${trip.date[0].to}') RETURNING *;`
    }
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

        let itiChoice

        if (trip.event[i].itinerary.length === 1){
            itiChoice = await query(
                `INSERT INTO itinerary_voting (trip_id, choice) VALUES ('${groupAndDestinationTable.rows[0].id}', 'the ${trip.event[i].itinerary[0].type} ${trip.event[i].itinerary[0].name}, on ${trip.event[i].itinerary[0].date_time}') RETURNING *;`
            )
        }
        else{
            itiChoice = await query(
                `INSERT INTO itinerary_voting (trip_id, choice) VALUES ('${groupAndDestinationTable.rows[0].id}', NULL) RETURNING *;`
        )
        }
        itineraryChoices.push(itiChoice.rows[0])

        for (let x = 0; x < trip.event[i].itinerary.length; x++){
            let itiChoice = await query(
                `INSERT INTO voting (itinerary_id, choice, type, date_time, vote_count) VALUES ('${itineraryChoices[i].id}', '${trip.event[i].itinerary[x].name}', '${trip.event[i].itinerary[x].type}', '${trip.event[i].itinerary[x].date_time}', '0' ) RETURNING *;`
            )              
                rowsIti.push(itiChoice.rows[0])
        }
    }

    let tripUsersArr = []
    for (let i = 0; i < trip.member.length; i++){
        const tripUsers = await query(
            `INSERT INTO trip_users (trip_id, user_id, joined, user_name) VALUES ('${groupAndDestinationTable.rows[0].id}', NULL, false, '${trip.member[i].user_name}') RETURNING *;`
        )
            
        tripUsersArr.push(tripUsers.rows)
    }
    const addAdminToTripUsers = await query(
            `INSERT INTO trip_users (trip_id, user_id, joined, user_name) VALUES ('${groupAndDestinationTable.rows[0].id}','${trip.admin_id}', true, 'admin') RETURNING *;`
    )
    tripUsersArr.push(addAdminToTripUsers.rows)
    


for (let i = 0; i < trip.member.length; i++){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: `SOCtravelherd@gmail.com`,
            pass: `qaaenynrkuisseja`
        }
    });
   // console.log(`${groupAndDestinationTable.rows[0].id} : ${trip.member[i].email} : ${trip.member[i].user_name}`)

    const mailOptions = {
        from: `${email}`,
        to: `${trip.member[i].email}`,
        subject: 'you have been invited to join a trip on travel herd',
        text: `a friend has invited you to join a group trip on travel herd! to join, navigate to travelherd.com, log in and go to join trip. 
        then enter '${trip.member[i].user_name}' as your username and '${groupAndDestinationTable.rows[0].id}' as the trip id.`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error)
        } else {
            console.log(`email sent: ${info.response}`)
        }
    })
}



  return {
            group: groupAndDestinationTable.rows,
            dates: dateTable.rows,
            date_choices: dateChoices,
            itinerary: rowsIti,
            itinerary_choices: itineraryChoices,
            member: tripUsersArr
        };
}
