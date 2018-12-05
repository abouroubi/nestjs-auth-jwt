import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger('ConfigurationService');

  private currentEnv: string = process.env.NODE_ENV || 'development';

  constructor() {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
  }

  get(key: string): string {
    return process.env[key];
  }

  get port(): string | number {
    return process.env.PORT || 3000;
  }

  get isDevelopment(): boolean {
    return this.currentEnv === 'development';
  }

  get mongoUri(): string {
    return process.env.MONGO_URI;
  }

  get JWT() {
    return {
      Key: process.env.JWT_KEY || 'DEMO_KEY',
      AccessTokenTtl: parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 60 * 5, // 5m
      RefreshTokenTtl: parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 30, // 30 Days
    };
  }
}
