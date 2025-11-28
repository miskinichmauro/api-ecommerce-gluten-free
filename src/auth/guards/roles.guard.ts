import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user) {
      throw new UnauthorizedException({
        message: 'Usuario no encontrado',
        code: 'AUTH_USER_NOT_FOUND',
        expose: true,
      });
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new UnauthorizedException({
        message: 'No tiene permisos para ejecutar este endpoint',
        code: 'AUTH_FORBIDDEN_ROLE',
        expose: true,
      });
    }

    return true;
  }
}
