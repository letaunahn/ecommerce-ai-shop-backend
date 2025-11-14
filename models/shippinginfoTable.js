import database from "../database/db.js";

export const createShippingInfoTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS shipping_info (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                order_id UUID NOT NULL UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                local VARCHAR(100) NOT NULL,
                province VARCHAR(100) NOT NULL,
                country VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                zipcode VARCHAR(10) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            );
        `
        await database.query(query)
    } catch (error) {
        console.error("Failed while creating shipping info table: ", error)
        process.exit(1)
    }
}