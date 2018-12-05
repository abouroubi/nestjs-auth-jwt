import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt-strategy';
import { TokenService } from './token/token.service';
import { RefreshToken } from './models/refresh-token.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RefreshToken.modelName, schema: RefreshToken.model.schema },
    ]),
  ],
  providers: [AuthService, JwtStrategy, TokenService],
  exports: [AuthService, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
