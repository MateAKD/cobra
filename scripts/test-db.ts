import mongoose from 'mongoose';
console.log('Mongoose loaded successfully');
const uri = process.env.MONGODB_URI;
console.log('URI present:', !!uri);
