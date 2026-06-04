import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

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

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing. Add it to .env.local and restart the dev server.');
  }

  const options = { serverSelectionTimeoutMS: 10000 };

  try {
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    if (mongoURI.startsWith('mongodb+srv://')) {
      const fallbackUri = srvToStandardUri(mongoURI);

      if (fallbackUri) {
        console.warn('SRV connection failed, retrying with standard URI...');
        await mongoose.disconnect().catch(() => {});
        try {
          await mongoose.connect(fallbackUri, options);
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

    await mongoose.disconnect().catch(() => {});
    console.warn(
      '[mongodb] Connection failed:',
      error instanceof Error ? error.message.split('\n')[0] : error
    );
    throw error;
  }

  return mongoose;
}

export async function tryConnectDB(): Promise<boolean> {
  try {
    await connectDB();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

export default connectDB;
