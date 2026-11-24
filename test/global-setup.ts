import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // Jest loads globalSetup and globalTeardown as separate modules, so the
  // running server is handed from one to the other through globalThis.
  var __MONGO_MEMORY_SERVER__: MongoMemoryServer | undefined;
}

export default async function globalSetup(): Promise<void> {
  globalThis.__MONGO_MEMORY_SERVER__ = await MongoMemoryServer.create();
  // Test workers are spawned after global setup, so they inherit this.
  process.env.MONGO_URI = globalThis.__MONGO_MEMORY_SERVER__.getUri(
    'nestjs-auth-jwt-e2e',
  );
}
