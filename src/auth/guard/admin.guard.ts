import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from '../interfaces/TokenPayload.interface';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, data, info: Error, context: ExecutionContext) {
    if (!data) throw new UnauthorizedException();
    if (data.role !== 'admin' || data.email != process.env.ADMIN_KEY) {
      throw new ForbiddenException('No right to access');
    }
    return data;
  }
}
