import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log("GUARD HIT");

        const request: any = context.switchToHttp().getRequest<Request>();

        const authHeader = request.headers.authorization;
        console.log("AUTH HEADER:", authHeader);

        if (!authHeader) {
            console.log("NO AUTH HEADER");
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];
        console.log("TOKEN:", token);

        try {
            const validateToken = await this.userService.verifyLoginToken(token);
            console.log("VALID TOKEN:", validateToken);

            request.user = validateToken;

            console.log("GUARD PASS");
            return true;

        } catch (err) {
            console.log("TOKEN ERROR:", err);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}