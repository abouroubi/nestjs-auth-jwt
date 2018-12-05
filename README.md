<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>



## Description

A sample NestJS application, demonstrating how to use JWT Authentication, with short lived access tokens, and long lived refresh tokens.

The architecture is opinionated, comments and PR are appreciated.

## Installation

```bash
$ npm install
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

Got to <a href="http://localhost:1337/api/swagger ">http://localhost:1337/api/swagger</a> to find the swagger doc.

## Roadmap

- Add third party providers Auth (Facebook, Google, Twitter, etc...)
- Add Redis cache for blacklisted access tokens (for now it's in memory)
- Update password, Lost password


## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

  Nest is [MIT licensed](LICENSE).
