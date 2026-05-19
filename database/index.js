import * as pg from 'pg'
import { neon } from "@neondatabase/serverless";



export const neonConnection = neon(process.env.DATABASE_URL);


const { Pool } = pg.default
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_URL,
});

export default function query(text, params) {
    return pool.query(text, params);
  }



export const createTripTable = () => {

  try{

        return await neonConnection.query(

            `CREATE TABLE IF NOT EXISTS trip (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
            trip_name TEXT, 
            destination TEXT, 
            admin_id INT,
            all_joined BOOLEAN,
            all_voted BOOLEAN, 
            no_of_users INT 
            );`
        );
    
    }catch(err){

        console.log(err);
    
    }finally{

        console.log("operation 'CT' complete");
    }
}


export const createTripTable = () => {

  try{

        return await neonConnection.query(

            `CREATE TABLE IF NOT EXISTS trip (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
            trip_name TEXT, 
            destination TEXT, 
            admin_id INT,
            all_joined BOOLEAN,
            all_voted BOOLEAN, 
            no_of_users INT 
            );`
        );
    
    }catch(err){

        console.log(err);
    
    }finally{

        console.log("operation 'CT' complete");
    }
}