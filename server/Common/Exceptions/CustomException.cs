using System;

namespace Common.Exceptions
{
    public class BusinessException : Exception
    {
        public string ErrorCode { get; }

        public BusinessException(string message, string errorCode = "BUSINESS_ERROR")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class UnauthorizedException : Exception
    {
        public string ErrorCode { get; }

        public UnauthorizedException(string message, string errorCode = "UNAUTHORIZED")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class NotFoundException : Exception
    {
        public string ErrorCode { get; }

        public NotFoundException(string message, string errorCode = "NOT_FOUND")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class ForbiddenException : Exception
    {
        public string ErrorCode { get; }

        public ForbiddenException(string message, string errorCode = "FORBIDDEN")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class ConflictException : Exception
    {
        public string ErrorCode { get; }

        public ConflictException(string message, string errorCode = "CONFLICT")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class UnprocessableEntityException : Exception
    {
        public string ErrorCode { get; }

        public UnprocessableEntityException(string message, string errorCode = "UNPROCESSABLE_ENTITY")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class UnsupportedMediaTypeException : Exception
    {
        public string ErrorCode { get; }

        public UnsupportedMediaTypeException(string message, string errorCode = "UNSUPPORTED_MEDIA_TYPE")
            : base(message)
        {
            ErrorCode = errorCode;
        }
    }

    public class TooManyRequestsException : Exception
    {
        public string ErrorCode { get; }
        public int RetryAfterSeconds { get; }

        public TooManyRequestsException(string message, int retryAfterSeconds = 60, string errorCode = "TOO_MANY_REQUESTS")
            : base(message)
        {
            ErrorCode = errorCode;
            RetryAfterSeconds = retryAfterSeconds;
        }
    }
}