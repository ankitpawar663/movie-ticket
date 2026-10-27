require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
  if (isProduction) { console.error('JWT_SECRET is not set (see .env.example)'); process.exit(1); }
  process.env.JWT_SECRET = 'local-development-only-secret';
  console.warn('JWT_SECRET is not set; using a development-only secret.');
}

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
    } else if (isProduction) {
      await mongoose.connect('mongodb://127.0.0.1:27017/imovies');
    } else {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri('imovies'));
      console.warn('MONGO_URI is not set; using temporary in-memory MongoDB. Data will be lost on restart.');
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log('IMovies API on port ' + port));
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

start();
