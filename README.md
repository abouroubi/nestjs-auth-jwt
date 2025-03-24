<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# NestJS JWT Authentication

> This is a fork of [abouroubi/nestjs-auth-jwt](https://github.com/abouroubi/nestjs-auth-jwt) with upgraded dependencies and additional features.

## Description

A robust NestJS application demonstrating secure authentication using JWT with a modern token management approach:

- **Short-lived access tokens** for secure API access
- **Long-lived refresh tokens** for seamless user experience
- **Token rotation** to enhance security
- **Token blacklisting** to prevent token reuse after logout

This project follows an opinionated architecture that separates concerns and promotes maintainability. It's built on NestJS 10.x with MongoDB for data persistence.

## Features

- **JWT Authentication** with access and refresh tokens
- **Secure password handling** with bcrypt
- **MongoDB integration** using Mongoose and Typegoose
- **API documentation** with Swagger UI
- **Input validation** with class-validator
- **Error handling** with custom exception filters
- **Response transformation** with interceptors (snake_case formatting)
- **Security enhancements** with Helmet middleware

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local instance or connection string)

## Installation

```bash
$ npm install
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/nestjs-auth-jwt
JWT_KEY=your-secret-key
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=30
NODE_ENV=development
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Access the Swagger documentation at [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) to explore and test the API endpoints.

## API Endpoints

- **Authentication**
  - POST `/api/auth/login` - Authenticate user and get tokens
  - POST `/api/auth/refresh-token` - Get new access token using refresh token
  - POST `/api/auth/logout` - Logout from current device
  - POST `/api/auth/logout-all` - Logout from all devices

- **User Management**
  - POST `/api/users` - Create a new user
  - GET `/api/users/me` - Get current user profile

## Authentication Flow

1. **Login**: User provides credentials and receives access token and refresh token
2. **API Access**: Access token is used for API requests (short-lived)
3. **Token Refresh**: When access token expires, refresh token is used to get a new access token
4. **Logout**: Refresh token is invalidated and access tokens are blacklisted

## Roadmap

- Add third-party authentication providers (Facebook, Google, Twitter, etc.)
- Implement Redis cache for blacklisted access tokens (currently in-memory)
- Add password update and password recovery functionality
- Implement rate limiting for authentication endpoints
- Add email verification for new accounts

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

This project is [MIT licensed](LICENSE).
