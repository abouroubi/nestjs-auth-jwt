import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const credentials = {
    email: 'auth-user@example.com',
    password: 'Secret123!',
  };

  const login = () =>
    request(app.getHttpServer()).post('/api/auth/login').send(credentials);

  const refresh = (refreshToken: string, accessToken: string) =>
    request(app.getHttpServer())
      .get('/api/auth/access_token')
      .auth(accessToken, { type: 'bearer' })
      .query({ grant_type: 'refresh_token', refresh_token: refreshToken });

  beforeAll(async () => {
    app = await createTestApp();
    await request(app.getHttpServer())
      .post('/api/user/register')
      .send({ ...credentials, gender: 'Other' })
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in with valid credentials', async () => {
    const response = await login().expect(HttpStatus.OK);

    expect(response.body).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      expires_in: expect.any(Number),
    });
  });

  it('issues new tokens for a valid refresh token', async () => {
    const { body: session } = await login().expect(HttpStatus.OK);

    const response = await refresh(
      session.refresh_token,
      session.access_token,
    ).expect(HttpStatus.OK);

    expect(response.body.access_token).toEqual(expect.any(String));
    expect(response.body.refresh_token).not.toEqual(session.refresh_token);
  });

  it('rejects an unknown refresh token', async () => {
    const { body: session } = await login().expect(HttpStatus.OK);

    await refresh('not-a-refresh-token', session.access_token).expect(
      HttpStatus.BAD_REQUEST,
    );
  });

  it('rejects logout without an access token', () => {
    return request(app.getHttpServer())
      .post('/api/auth/logout')
      .query({ from_all: true })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("revokes the user's refresh tokens on logout from all devices", async () => {
    const { body: session } = await login().expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .auth(session.access_token, { type: 'bearer' })
      .query({ from_all: true })
      .expect(HttpStatus.OK);

    await refresh(session.refresh_token, session.access_token).expect(
      HttpStatus.BAD_REQUEST,
    );
  });
});
