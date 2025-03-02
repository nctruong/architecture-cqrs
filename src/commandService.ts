import express from "express";
import { saveEvent } from "./eventStore";
import Redis from "ioredis";

const app = express();
const redis = new Redis();
app.use(express.json());

// 🔹 Create Order (Saves Event)
app.post("/orders", async (req, res) => {
    const { id, product, quantity } = req.body;

    const event = {
        aggregateId: id, // Order ID
        type: "ORDER_CREATED",
        timestamp: new Date(),
        payload: { product, quantity, status: "pending" }
    };

    // 💾 Save Event in MongoDB
    await saveEvent(event);

    // 📢 Publish to Redis (Event Bus)
    redis.publish("ORDER_EVENTS", JSON.stringify(event));

    res.status(201).json({ message: "Order Created", event });
});

app.listen(4000, () => console.log("🚀 Command Service running on port 4000"));
