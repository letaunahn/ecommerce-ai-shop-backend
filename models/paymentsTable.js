import database from "../database/db.js";

export const createPaymentsTable = async () => {
    try {
        const query = ` CREATE TABLE IF NOT EXISTS payments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID NOT NULL UNIQUE,
            payment_type VARCHAR(20) NOT NULL CHECK(payment_type IN ('Online', 'Cash On Delivery')),
            payment_status VARCHAR(20) NOT NULL CHECK(payment_status IN ('Paid', 'Pending', 'Failed')),
            payment_intent_id VARCHAR(255) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        `
        database.query(query)
    } catch (error) {
        console.error("Failed while creating payments table: ", error)
        process.exit(1)
    }
}