import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { snakeCase, mapKeys } from 'lodash';
import { isArray } from 'util';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(
      map(value => {
        const snakeCaseMapper = val => mapKeys(val, (v, k) => snakeCase(k));
        if (isArray(value)) {
          return value.map(v => snakeCaseMapper(v));
        }
        return snakeCaseMapper(value);
      }),
    );
  }
}
