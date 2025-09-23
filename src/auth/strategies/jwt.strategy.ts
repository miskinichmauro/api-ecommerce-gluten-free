import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        
        super({
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: payload.id });

        if (!user) {
            throw new UnauthorizedException('Token no válido');
        }

        if (user.deletedAt) {
            throw new UnauthorizedException('Usuario inactivo');
        }

        return user;
    }
}