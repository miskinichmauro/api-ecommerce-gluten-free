import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return user;
    }
);
