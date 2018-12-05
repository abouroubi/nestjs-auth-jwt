import {
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Catch,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    if (error.getStatus() === HttpStatus.UNAUTHORIZED) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message ||
          'You do not have permission to access this resource';
      }
    }

    // Manage errors from class-vlidator
    if (
      Array.isArray(error.response.message) &&
      error.response.message.length > 0 &&
      error.response.message[0].constraints
    ) {
      const errorsList = error.response.message.map(e => {
        return { field: e.property, errors: e.constraints };
      });

      error.response.errors = errorsList;
      error.response.message = 'Validation error occured';
    }

    res.status(error.getStatus()).json({
      error: {
        statusCode: error.getStatus(),
        error: error.response.name || error.response.error || error.name,
        message: error.response.message || error.response || error.message,
        errors: error.response.errors || null,
        timestamp: new Date().toISOString(),
        path: req ? req.url : null,
      },
    });
  }
}
