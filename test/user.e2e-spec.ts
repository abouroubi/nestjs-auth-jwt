import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const register = (body: object) =>
    request(app.getHttpServer()).post('/api/user/register').send(body);

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user and returns the profile without the password', async () => {
    const response = await register({
      email: 'new-user@example.com',
      password: 'Secret123!',
      firstName: 'Ada',
      lastName: 'Lovelace',
      gender: 'Female',
    }).expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      email: 'new-user@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      gender: 'Female',
    });
    expect(response.body).not.toHaveProperty('password');
  });

  it('rejects an email that is already registered', async () => {
    const user = {
      email: 'taken@example.com',
      password: 'Secret123!',
      gender: 'Male',
    };
    await register(user).expect(HttpStatus.CREATED);

    await register(user).expect(HttpStatus.BAD_REQUEST);
  });
});
