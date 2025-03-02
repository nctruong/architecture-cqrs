import { Pool } from "pg";
import Redis from "ioredis";

const pool = new Pool({ connectionString: "postgresql://user:pass@localhost:5432/read_db" });
const redis = new Redis();

// 🔹 Ensure Read Model Table Exists
pool.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product TEXT,
    quantity INT,
    status TEXT
  );
`);

// 🔹 Listen for ORDER_EVENTS
redis.subscribe("ORDER_EVENTS");
redis.on("message", async (channel, message) => {
    if (channel === "ORDER_EVENTS") {
        const event = JSON.parse(message);

        if (event.type === "ORDER_CREATED") {
            await pool.query("INSERT INTO orders (id, product, quantity, status) VALUES ($1, $2, $3, $4)", [
                event.aggregateId, event.payload.product, event.payload.quantity, event.payload.status
            ]);
        }
    }
});
