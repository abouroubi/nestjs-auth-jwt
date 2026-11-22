import { Constants } from './constants';

describe('Constants.EmailRegex', () => {
  it.each([
    'user@mail.com',
    'first.last@sub.domain.org',
    'user+tag@mail.co',
    'user-name@my-domain.io',
    '"quoted local"@mail.com',
    'user@[192.168.1.1]',
  ])('should accept %s', (email) => {
    expect(Constants.EmailRegex.test(email)).toBe(true);
  });

  it.each([
    '',
    'plainaddress',
    '@mail.com',
    'user@',
    'user@mail',
    'user@@mail.com',
    'user name@mail.com',
    'user[x]@mail.com',
    'user]@mail.com',
    '.user@mail.com',
    'user.@mail.com',
    'user@mail.c',
    'user@[192.168.1]',
  ])('should reject %j', (email) => {
    expect(Constants.EmailRegex.test(email)).toBe(false);
  });
});
