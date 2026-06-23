import mongoose from 'mongoose';

export default async function globalTeardown() {
    console.log('Cleaning up...');
    await mongoose.connection.close();
    console.log('Connection closed');
    await globalThis.mongoServer?.stop();
    console.log('Mock MongoDB stopped');
}