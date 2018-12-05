import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../jwt-payload';
import { ConfigurationService } from '../../shared/configuration/configuration.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configurationService: ConfigurationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('access_token'),
      ]),
      secretOrKey: configurationService.JWT.Key,
      passReqToCallback: true,
    });
  }

  async validate(req, payload: JwtPayload) {
    // Little hack but ¯\_(ツ)_/¯
    const self: any = this;
    const token = self._jwtFromRequest(req);
    // We can now use this token to check it against black list
    // @todo: check against black list :D
    const result = await this.authService.validatePayload(payload);
    if (!result) {
      throw new UnauthorizedException();
    }
    return result;
  }
}
