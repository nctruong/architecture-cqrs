// src/writeService.ts
import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// 🔹 Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/orders_db");

const orderSchema = new mongoose.Schema({
    product: String,
    quantity: Number,
    status: { type: String, default: "pending" },
});

const Order = mongoose.model("Order", orderSchema);

// 🔹 Redis Pub/Sub for event notification
const redis = new Redis();

// 🔹 Create Order (Command)
app.post("/orders", async (req, res) => {
    const { product, quantity } = req.body;

    const order = new Order({ product, quantity });
    await order.save();

    // Publish order event
    redis.publish("ORDER_CREATED", JSON.stringify(order));

    res.status(201).json(order);
});

// 🔹 Update Order Status
// @ts-ignore
app.put("/orders/:id", async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) return res.status(404).json({ error: "Order not found" });

    redis.publish("ORDER_UPDATED", JSON.stringify(order));
    res.json(order);
});

app.listen(4000, () => console.log("🚀 Write Service running on port 4000"));
