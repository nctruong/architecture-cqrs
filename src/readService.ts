import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
const pool = new Pool({ connectionString: "postgresql://user:pass@localhost:5432/read_db" });
const redisClient = new Redis();
const redisSubscriber = new Redis();

// 🔹 Query Order with Cache
// @ts-ignore
app.get("/orders/:id", async (req, res) => {
    const orderId = req.params.id;

    // Check Redis Cache
    const cachedOrder = await redisClient.get(`order:${orderId}`);
    if (cachedOrder) {
        console.log("Hit cached order", cachedOrder);
        return res.json(JSON.parse(cachedOrder));
    }

    // Query PostgreSQL
    const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: "Order not found" });

    // Cache in Redis (TTL: 60s)
    await redisClient.setex(`order:${orderId}`, 60, JSON.stringify(rows[0]));

    console.log(`No cache. Query Postgres ${JSON.stringify(rows)}`);
    res.json(rows[0]);
});

// 🔹 Subscribe to Events for Cache Invalidation
redisSubscriber.subscribe("ORDER_EVENTS");
redisSubscriber.on("message", async (channel, message) => {
    const event = JSON.parse(message);
    if (event.type === "ORDER_CREATED") {
        await redisClient.del(`order:${event.aggregateId}`);
    }
});

app.listen(5001, () => console.log("🚀 Read Service running on port 5001"));
