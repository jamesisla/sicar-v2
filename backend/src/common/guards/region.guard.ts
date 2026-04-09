import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RegionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const regionParam = parseInt(request.query?.region || request.params?.region);

    // Region 90 = national access, no restriction
    if (!user || user.region === 90) return true;

    if (regionParam && regionParam !== user.region) {
      throw new ForbiddenException('No tiene permisos para acceder a datos de esta región');
    }
    return true;
  }
}
