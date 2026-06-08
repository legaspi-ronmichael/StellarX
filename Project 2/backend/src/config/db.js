import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  let uri = process.env.MONGODB_URI;
  const useMemory = !uri || uri.includes('localhost') && process.env.USE_MEMORY_DB === 'true';

  if (useMemory || process.env.USE_MEMORY_DB === 'true') {
    console.log('⚠️  No MONGODB_URI set or USE_MEMORY_DB=true — using in-memory MongoDB');
    console.log('   (data will be lost when the server stops)');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('✅ In-memory MongoDB started at', uri);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });

  return uri;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
