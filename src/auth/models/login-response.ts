export class LoginResponse {
  accessToken: string;
  tokenType?: string = 'bearer';
  expiresIn: number;
  refreshToken?: string;
}
