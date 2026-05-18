import { neonConnection } from './index.js';

export const createAllTables = async () => {
  try {
    const usersCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        auth_id VARCHAR(100) UNIQUE,
        name TEXT,
        email TEXT UNIQUE
      )
    `);
    console.log('Users table created:', usersCreated);

    const tripsCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS trip (
        id SERIAL PRIMARY KEY,
        trip_name TEXT NOT NULL,
        destination TEXT,
        admin_id VARCHAR(100) REFERENCES users(id),
        no_of_users INT,
        all_joined BOOLEAN DEFAULT FALSE,
        all_voted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Trips table created:', tripsCreated);

    const trip_usersCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS trip_users (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES trip(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined TIMESTAMP DEFAULT NOW(),
        UNIQUE(trip_id, user_id)
      )
    `);

    const itinerary_votingCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS itinerary_voting (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES trip(id) ON DELETE CASCADE,
        choice TEXT NOT NULL
      )
    `);

    const votingCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS voting (
        id SERIAL PRIMARY KEY,
        itinerary_id INT NOT NULL REFERENCES itinerary_voting(id) ON DELETE CASCADE,
        type TEXT,
        choice TEXT,
        date_time TIMESTAMP DEFAULT NOW(),
        vote_count INT DEFAULT 0
      )
    `);

    const votingUsersCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS voted_user (
        id SERIAL PRIMARY KEY,
        vote_id INT NOT NULL,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type_of_vote TEXT
      )
    `);

    const trip_datesCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS dates (
        id SERIAL PRIMARY KEY,
        date_id INT NOT NULL REFERENCES trip_date(id) ON DELETE CASCADE,
        choice DATE NOT NULL,
        vote_count INT DEFAULT 0
      )
    `);

    const trip_date_choicesCreated = await neonConnection.query(`
      CREATE TABLE IF NOT EXISTS trip_date (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES trip(id) ON DELETE CASCADE,
        chosen DATE
      )
    `);

    console.log('All tables created');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};