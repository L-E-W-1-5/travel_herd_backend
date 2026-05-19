import query from "../database/index.js";
import nodemailer from 'nodemailer'
import { neonConnection } from "../database/index.js";

const email = process.env.NODEMAILER_EMAIL;
const password = process.env.NODEMAILER_PASSWORD;


export async function getTrips(user_id) {
  const allTrips = await neonConnection.query(
    `SELECT trip.trip_name, trip.trip_id FROM members INNER JOIN trip ON trip.trip_id = members.trip_id WHERE members.user_id = ${user_id} RETURNING *`
  );
  return allTrips.rows;
}

export async function createTrip(trip) {

    let member_count = trip.member.length + 1  

    console.log(trip);

    const groupAndDestinationTable = await neonConnection.query(
        `INSERT INTO trip (trip_name, destination, admin_id, no_of_users, all_joined, all_voted) VALUES ('${trip.group}', '${trip.destination}', '${trip.admin_id}', '${member_count}', false, false) RETURNING *`
    );

    let dateTable = null;

    if (trip.date.length === 1){
        dateTable = await neonConnection.query(
        `INSERT INTO trip_date (trip_id, chosen) VALUES ('${groupAndDestinationTable[0].id}', 'from: ${trip.date[0].from} to: ${trip.date[0].to}') RETURNING *;` 
        )
    }
    else{

        dateTable = await neonConnection.query(

            `INSERT INTO trip_date (trip_id, chosen) VALUES ('${groupAndDestinationTable[0].id}', NULL) RETURNING *;`
        )
    }

    let dateChoices = []
   
    for (let i = 0; i < trip.date.length; i++){
        let dateChoice = await neonConnection.query(
            `INSERT INTO dates (date_id, choice, vote_count) VALUES ('${dateTable[0].id}', 'from: ${trip.date[i].from} to: ${trip.date[i].to}', '0') RETURNING *;`
        );
        dateChoices.push(dateChoice)
   }

     let itineraryChoices = []
     let rowsIti = []

    for (let i = 0; i < trip.event.length; i++){

        let itiChoice

        if (trip.event[i].itinerary.length === 1){
            itiChoice = await neonConnection.query(
                `INSERT INTO itinerary_voting (trip_id, choice) VALUES ('${groupAndDestinationTable[0].id}', 'the ${trip.event[i].itinerary[0].type} ${trip.event[i].itinerary[0].name}, on ${trip.event[i].itinerary[0].date_time}') RETURNING *;`
            )

            itineraryChoices.push(itiChoice[0])
        }
        else{
            itiChoice = await neonConnection.query(
                `INSERT INTO itinerary_voting (trip_id, choice) VALUES ('${groupAndDestinationTable[0].id}', NULL) RETURNING *;`
            )

            itineraryChoices.push(itiChoice[0])
        }

        for (let x = 0; x < trip.event[i].itinerary.length; x++){
            let itiChoice = await neonConnection.query(
                `INSERT INTO voting (itinerary_id, choice, type, date_time, vote_count) VALUES ('${itineraryChoices[i].id}', '${trip.event[i].itinerary[x].name}', '${trip.event[i].itinerary[x].type}', '${trip.event[i].itinerary[x].date_time}', '0' ) RETURNING *;`
            )              
                rowsIti.push(itiChoice[0])
        }
    }

    let tripUsersArr = []
    for (let i = 0; i < trip.member.length; i++){
        const tripUsers = await neonConnection.query(
            `INSERT INTO trip_users (trip_id, user_id, joined, user_name) VALUES ('${groupAndDestinationTable[0].id}', NULL, false, '${trip.member[i].user_name}') RETURNING *;`
        )
            
        tripUsersArr.push(tripUsers.rows)
    }
    const addAdminToTripUsers = await neonConnection.query(
            `INSERT INTO trip_users (trip_id, user_id, joined, user_name) VALUES ('${groupAndDestinationTable[0].id}','${trip.admin_id}', true, 'admin') RETURNING *;`
    )
    tripUsersArr.push(addAdminToTripUsers)
    


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
        text: `a friend has invited you to join a group trip on travel herd! to join, navigate to https://soc-travelherd.netlify.app/, log in and go to join trip. 
        then enter '${trip.member[i].user_name}' as your username and '${groupAndDestinationTable[0].id}' as the trip id.`
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
            group: groupAndDestinationTable,
            dates: dateTable,
            date_choices: dateChoices,
            itinerary: rowsIti,
            itinerary_choices: itineraryChoices,
            member: tripUsersArr
        };
}
