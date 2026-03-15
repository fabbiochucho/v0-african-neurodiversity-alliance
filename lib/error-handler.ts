export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const errorHandler = (error: unknown) => {
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
    };
  }

  return {
    status: 500,
    body: {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  };
};

export const createSuccessResponse = <T>(data: T, statusCode = 200) => ({
  status: statusCode,
  body: {
    success: true,
    data,
  },
});

export const createErrorResponse = (statusCode: number, code: string, message: string) => ({
  status: statusCode,
  body: {
    success: false,
    error: code,
    message,
  },
});
