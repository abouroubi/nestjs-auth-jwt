export default async function globalTeardown(): Promise<void> {
  await globalThis.__MONGO_MEMORY_SERVER__?.stop();
}
