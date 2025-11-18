import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

const ADMIN_PASSWORD = 'Taub6132';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check for admin password in header (for password-protected admin access)
    const adminPassword = request.headers['x-admin-password'];
    
    // Allow access if:
    // 1. User is authenticated and is an admin, OR
    // 2. Admin password is provided in header
    if (adminPassword === ADMIN_PASSWORD) {
      return true;
    }

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

