export enum ERROR_TYPES {
  NOT_FOUND_ENTITY = 'notFoundEntity',
  DUPLICATE_ENTITY = 'duplicateEntity',
  INVALID_MEDIA_TYPE = 'invalidMediaType',
  INVALID_INPUT = 'invalidInput',
  VALIDATION_ERROR = 'validationError',
  INTERNAL_ERROR = 'internalError',
  REQUIRED_FIELD = 'requiredField',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  TOKEN_EXPIRED = 'tokenExpired',
  TOKEN_INVALID = 'tokenInvalid',
  RATE_LIMIT_EXCEEDED = 'rateLimitExceeded',
}

export enum ERROR_HTTP_STATUS {
  notFoundEntity = 404,
  duplicateEntity = 409,
  invalidInput = 400,
  requiredField = 400,
  invalidMediaType = 415,
  validationError = 422,
  internalError = 500,
  unauthorized = 401,
  forbidden = 403,
  tokenExpired = 401,
  tokenInvalid = 401,
  rateLimitExceeded = 429,
}
