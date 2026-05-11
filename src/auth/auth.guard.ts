import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './auth.public';
import { Reflector } from '@nestjs/core';
import { PayloadType, RequestAuth } from 'src/types/auth.type';
import { SessionService } from 'src/auth/session/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  /**
   * Détermine si la requête actuelle est autorisée à se poursuivre.
   * Vérifie si la route est publique et, le cas échéant, valide le jeton JWT.
   * @param context Le contexte d'exécution de la requête.
   * @returns Un booléen indiquant si la requête peut se poursuivre.
   * @throws Une exception UnauthorizedException si le jeton est manquant ou invalide.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 Voir cette condition
      return true;
    }

    const request: RequestAuth = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: PayloadType = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (payload.role === 'unauthenticated') {
        throw new UnauthorizedException('Email not verified');
      }

      const expiredNumb = new Date(payload.expiresAt);

      if (Date.now() > expiredNumb.getTime()) {
        throw new UnauthorizedException('Token expired...');
      }

      const session = await this.sessionService.findSessionByToken(token);

      if (session?.loggedOut) {
        throw new UnauthorizedException('User is LoggedOut...');
      }

      // 💡 Nous attribuons ici le payload à l'objet de la requête
      // afin que nous puissions y accéder dans nos gestionnaires de routes
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException(
        (error as any)?.message || 'Invalid token',
      );
    }
    return true;
  }

  /**
   * Extracts the token from the Authorization header.
   * @param request The incoming HTTP request.
   * @returns The extracted token or undefined if not found.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
