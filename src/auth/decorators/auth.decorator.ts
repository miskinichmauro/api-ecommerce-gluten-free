import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';

export const META_ROLES = 'roles';
export function Auth(...roles: Roles[]) {
  return applyDecorators(
    SetMetadata(META_ROLES, roles),
    UseGuards(AuthGuard(), RolesGuard),
  );
}
