import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
    (context: ExecutionContext) => {
        const { user } = context.switchToHttp().getRequest<{ user: User }>();
    
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }
    }
);
