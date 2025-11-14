import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Client } = pkg

const database = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

try {
    await database.connect()
    console.log("Connected to the database successfully!".bgCyan.white)
} catch (error) {
    console.error(`Database connection failed: ${error}`.bgRed.white)
    process.exit(1)
}

export default database