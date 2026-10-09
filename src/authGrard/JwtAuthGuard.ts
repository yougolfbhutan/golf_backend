/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/users' },
  { method: 'POST', path: '/users/login' },
  { method: 'POST', path: '/users/forgot-password' },
];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const method = request.method;
    const path = (request.route?.path || request.url)
      .split('?')[0]
      .replace(/\/$/, '');

    const isPublic = PUBLIC_ROUTES.some(
      // eslint-disable-next-line prettier/prettier
      (route) => route.method === method && route.path === path
    );

    if (isPublic) return true;

    const token =
      request.cookies?.access_token ||
      request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
