import { MongoClient } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "eventstore";
const COLLECTION = "events";

const client = new MongoClient(MONGO_URL);

async function connectDB() {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db(DB_NAME);
    return db.collection(COLLECTION);
}

// @ts-ignore
export async function saveEvent(event: any) {
    const eventCollection = await connectDB();
    await eventCollection.insertOne(event);
}

export async function getEventsByAggregateId(aggregateId: string) {
    const eventCollection = await connectDB();
    return eventCollection.find({ aggregateId }).toArray();
}
