import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance using connection string from MONGO_URI.
 * Logs connection status and handles connection errors.
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cloudcart';
    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
