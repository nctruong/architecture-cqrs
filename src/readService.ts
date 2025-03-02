import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
const pool = new Pool({ connectionString: "postgresql://user:pass@localhost:5432/read_db" });

// 🔹 Separate Redis Clients for different purposes
const redisClient = new Redis(); // Normal commands (set, get, del)
const redisSubscriber = new Redis(); // For subscribing to events

// 🔹 Get Order (Query) with Cache
// @ts-ignore
app.get("/orders/:id", async (req, res) => {
    const orderId = req.params.id;

    // 🔍 Check Redis Cache First
    const cachedOrder = await redisClient.get(`order:${orderId}`);
    if (cachedOrder) {
        console.log("✅ Cache Hit: Returning from Redis");
        return res.json(JSON.parse(cachedOrder));
    }

    console.log("❌ Cache Miss: Querying PostgreSQL");

    // 🛢 Query PostgreSQL
    const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);

    if (rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const order = rows[0];

    // 🏪 Store in Redis Cache (Expires in 60s)
    await redisClient.setex(`order:${orderId}`, 60, JSON.stringify(order));

    res.json(order);
});

// 🔹 Listen for Order Events (Sync Read Model)
redisSubscriber.subscribe("ORDER_CREATED", "ORDER_UPDATED");
redisSubscriber.on("message", async (channel, message) => {
    const order = JSON.parse(message);

    if (channel === "ORDER_CREATED") {
        await pool.query("INSERT INTO orders (id, product, quantity, status) VALUES ($1, $2, $3, $4)", [
            order._id, order.product, order.quantity, order.status,
        ]);
    } else if (channel === "ORDER_UPDATED") {
        await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [order.status, order._id]);
    }

    // 🗑 Invalidate Cache After Update using a separate Redis client
    await redisClient.del(`order:${order._id}`);
});

app.listen(5001, () => console.log("🚀 Read Service running on port 5001"));
