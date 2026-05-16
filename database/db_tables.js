import { neonConnection} from './index.js';


export const createAllTables = () => {
    
const usersCreated = neonConnection.query(`
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_id TEXT UNIQUE,
  name TEXT,
  email TEXT UNIQUE
  `
);
console.log(isCreated);

const tripsCreated = neonConnection.query(`
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  trip_name TEXT NOT NULL,
  destination TEXT,
  admin_id INT REFERENCES users(id),
  no_of_users INT,
  end_joined BOOLEAN DEFAULT FALSE,
  all_voted BOOLEAN DEFAULT FALSE
`
);
console.log(tripsreated);


const trip_usersCreated = neonConnection.query(`
CREATE TABLE trip_users (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined TIMESTAMP DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
`
);



const itinerary_votingCreated = neonConnection.query(`
CREATE TABLE itinerary_voting (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  choice TEXT NOT NULL
`
);



const votingCreated = neonConnection.query(`
CREATE TABLE voting (
  id SERIAL PRIMARY KEY,
  itinerary_id INT NOT NULL REFERENCES itinerary_voting(id) ON DELETE CASCADE,
  type TEXT,
  choice TEXT,
  date_time TIMESTAMP DEFAULT NOW(),
  vote_count INT DEFAULT 1
`
);


const votingCreated = neonConnection.query(`
CREATE TABLE voted_user(
  id SERIAL PRIMARY KEY,
  vote_id INT NOT NULL REFERENCES itinerary_voting(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type_of_vote TEXT
`
);





const trip_datesCreated = neonConnection.query(`
CREATE TABLE dates (
  id SERIAL PRIMARY KEY,
  date_id INT NOT NULL REFERENCES trip_dates(id) ON DELETE CASCADE,
  choice DATE NOT NULL,
  vote_count INT DEFAULT 0
`
);



const trip_dates_votesCreated = neonConnection.query(`
CREATE TABLE trip_date (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  chosen DATE
`
);

};