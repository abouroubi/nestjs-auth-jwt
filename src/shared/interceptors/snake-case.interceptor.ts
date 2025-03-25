import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { snakeCase, mapKeys, isArray } from 'lodash';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map(value => {
        if (!value) return value;
        
        const snakeCaseMapper = val => {
          if (!val || typeof val !== 'object') return val;
          return mapKeys(val, (v, k) => snakeCase(k));
        };
        
        if (isArray(value)) {
          return value.map(v => snakeCaseMapper(v));
        }
        return snakeCaseMapper(value);
      }),
    );
  }
}
