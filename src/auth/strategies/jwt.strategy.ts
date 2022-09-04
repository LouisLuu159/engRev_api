import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfigKey } from 'src/common/config/baseConfig';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/TokenPayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.Authentication;
          return request?.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get(BaseConfigKey.ACCESS_TOKEN_SECRET),
    });
  }

  async validate(data: TokenPayload) {
    return data;
  }
}
