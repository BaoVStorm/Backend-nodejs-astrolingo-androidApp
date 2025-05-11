const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.bold);
}

module.exports = connectDB;

/*

import { connect } from 'mongoose';

const connectDB = async () => {
    const conn = await connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.bold);
}

export default connectDB;

*/