import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects GET /api without an access token', () => {
    return request(app.getHttpServer()).get('/api').expect(401);
  });

  it('serves no routes outside the /api prefix', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
});
