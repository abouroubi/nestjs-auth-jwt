import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Injects the user authenticated by the JWT guard, or one of its properties
 * when a name is given, e.g. `@User('id')`.
 */
export const User = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();
    return property ? user[property] : user;
  },
);
