import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
};

export function normalizeEnvHash(hash?: string) {
  if (!hash) return hash;
  return hash.replace(/^["']|["']$/g, '').replace(/\\\$/g, '$');
}

export function getAdminPasswordHash() {
  return normalizeEnvHash(process.env.ADMIN_PASSWORD_HASH);
}

function srvToStandardUri(srvUri: string) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/);
  if (!match) return null;

  const [, credentials, host, database, query = ''] = match;
  const params = new URLSearchParams(query.replace(/^\?/, ''));
  params.set('ssl', 'true');
  params.set('authSource', 'admin');

  const clusterPrefix = host.split('.')[0];
  const domain = host.substring(clusterPrefix.length + 1);
  const shards = [0, 1, 2]
    .map((n) => `${clusterPrefix}-shard-00-0${n}.${domain}:27017`)
    .join(',');

  return `mongodb://${credentials}@${shards}/${database}?${params.toString()}`;
}

function waitForConnection() {
  return new Promise<void>((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }

    const onConnected = () => {
      cleanup();
      resolve();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      mongoose.connection.off('connected', onConnected);
      mongoose.connection.off('error', onError);
    };

    mongoose.connection.once('connected', onConnected);
    mongoose.connection.once('error', onError);
  });
}

async function connectOnce(mongoURI: string) {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    await waitForConnection();
    return mongoose;
  }

  try {
    await mongoose.connect(mongoURI, CONNECT_OPTIONS);
    console.log('MongoDB connected successfully.');
    return mongoose;
  } catch (error) {
    if (!mongoURI.startsWith('mongodb+srv://')) {
      throw error;
    }

    const fallbackUri = srvToStandardUri(mongoURI);
    if (!fallbackUri) {
      throw error;
    }

    console.warn('SRV connection failed, retrying with standard URI...');
    await mongoose.disconnect().catch(() => {});

    try {
      await mongoose.connect(fallbackUri, CONNECT_OPTIONS);
      console.log('MongoDB connected successfully (standard URI).');
      return mongoose;
    } catch (fallbackError) {
      await mongoose.disconnect().catch(() => {});
      console.warn(
        '[mongodb] Standard URI failed:',
        fallbackError instanceof Error ? fallbackError.message.split('\n')[0] : fallbackError
      );
      throw fallbackError;
    }
  }
}

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing. Add it to .env.local and restart the dev server.');
  }

  return connectOnce(mongoURI);
}

export async function tryConnectDB(attempts = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await connectDB();
      return mongoose.connection.readyState === 1;
    } catch (error) {
      await mongoose.disconnect().catch(() => {});

      if (attempt === attempts) {
        console.warn(
          '[mongodb] Connection failed after retries:',
          error instanceof Error ? error.message.split('\n')[0] : error
        );
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }

  return false;
}

export default async function ensureDB() {
  const connected = await tryConnectDB();
  if (!connected) {
    throw new Error('Unable to connect to MongoDB');
  }
  return mongoose;
}
