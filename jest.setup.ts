import { MongoMemoryReplSet } from 'mongodb-memory-server';
import dotenv from 'dotenv';

export default async function globalSetup() {
    dotenv.config();
    console.log('Setting up mock Mongo server...');

    const mongod = await MongoMemoryReplSet.create({ replSet: { count: 2 } });
    globalThis.mongoServer = mongod;
    process.env.MONGO_URI = await mongod.getUri();

    console.log('Mock MongoDB ready at', process.env.MONGO_URI);
}