using System;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Common.Exceptions;
using Model.Constants;
using Service.Interfaces.Base;
using Serilog;

namespace Api.Filters;

public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ISysMessageService _sysMsg;

    public GlobalExceptionFilter(ISysMessageService sysMsg)
    {
        _sysMsg = sysMsg;
    }

    public void OnException(ExceptionContext context)
    {
        var methodName = context.ActionDescriptor.DisplayName;
        var exception = context.Exception;

        switch (exception)
        {
            case BusinessException businessEx:
                HandleBusinessException(context, businessEx, methodName);
                break;

            case UnauthorizedException unauthorizedEx:
                HandleUnauthorizedException(context, unauthorizedEx, methodName);
                break;

            case NotFoundException notFoundEx:
                HandleNotFoundException(context, notFoundEx, methodName);
                break;

            case ForbiddenException forbiddenEx:
                HandleForbiddenException(context, forbiddenEx, methodName);
                break;

            case ConflictException conflictEx:
                HandleConflictException(context, conflictEx, methodName);
                break;

            case UnprocessableEntityException unprocessableEntityEx:
                HandleUnprocessableEntityException(context, unprocessableEntityEx, methodName);
                break;

            case UnsupportedMediaTypeException unsupportedMediaTypeEx:
                HandleUnsupportedMediaTypeException(context, unsupportedMediaTypeEx, methodName);
                break;

            case TooManyRequestsException tooManyRequestsEx:
                HandleTooManyRequestsException(context, tooManyRequestsEx, methodName);
                break;

            // Xử lý mặc định cho các exception không xác định
            default:
                HandleDefaultException(context, exception, methodName);
                break;
        }

        // Đánh dấu exception đã được xử lý
        context.ExceptionHandled = true;
    }

    private void HandleBusinessException(ExceptionContext context, BusinessException exception, string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.BadRequest
        };
    }

    private void HandleUnauthorizedException(ExceptionContext context, UnauthorizedException exception,
        string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.Unauthorized // 401
        };
    }

    private void HandleNotFoundException(ExceptionContext context, NotFoundException exception, string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message ?? _sysMsg.Get(EMessage.Error404Msg),
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.NotFound // 404
        };
    }

    private void HandleForbiddenException(ExceptionContext context, ForbiddenException exception, string methodName)
    {
        Log.Warning(exception, $"Forbidden access in {methodName}: {exception.Message}");
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.Forbidden // 403
        };
    }

    private void HandleConflictException(ExceptionContext context, ConflictException exception, string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.Conflict // 409
        };
    }

    private void HandleUnprocessableEntityException(ExceptionContext context, UnprocessableEntityException exception,
        string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.UnprocessableEntity // 422
        };
    }

    private void HandleUnsupportedMediaTypeException(ExceptionContext context, UnsupportedMediaTypeException exception,
        string methodName)
    {
        context.Result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = (int)HttpStatusCode.UnsupportedMediaType // 415
        };
    }

    private void HandleTooManyRequestsException(ExceptionContext context, TooManyRequestsException exception,
        string methodName)
    {
        Log.Warning(exception, $"Rate limit exceeded in {methodName}: {exception.Message}");

        var result = new ObjectResult(new
        {
            message = exception.Message,
            code = exception.ErrorCode
        })
        {
            StatusCode = 429
        };

        context.HttpContext.Response.Headers.Add("Retry-After", exception.RetryAfterSeconds.ToString());
        context.Result = result;
    }

    private void HandleDefaultException(ExceptionContext context, Exception exception, string methodName)
    {
        Log.Error(exception, $"An error occurred during {methodName?.ToLower()} operation");

        context.Result = new ObjectResult(new
        {
            message = _sysMsg.Get(EMessage.Error500Msg),
            code = "SYSTEM_ERROR"
        })
        {
            StatusCode = (int)HttpStatusCode.InternalServerError
        };
    }
}