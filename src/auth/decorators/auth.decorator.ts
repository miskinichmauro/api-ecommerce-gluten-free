import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';

export const META_ROLES = 'roles';
export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata(META_ROLES, roles),
    UseGuards(AuthGuard(), RolesGuard),
  );
}
