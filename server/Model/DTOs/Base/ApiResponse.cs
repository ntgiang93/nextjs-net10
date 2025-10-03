using System.Net;

namespace Model.DTOs.Base
{
    /// <summary>
    /// Generic API response model to standardize all API responses
    /// </summary>
    /// <typeparam name="T">Type of data returned</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indicates whether the API call was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Status code of the response
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// Message returned from the API (success or error message)
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Data returned from the API
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// Optional error code for specific error handling on client
        /// </summary>
        public string ErrorCode { get; set; }

        /// <summary>
        /// Creates a successful response with data
        /// </summary>
        /// <param name="data">Data to return</param>
        /// <param name="message">Optional success message</param>
        /// <returns>ApiResponse with success status</returns>
        public static ApiResponse<T> Succeed(T? data, string message = "Operation completed successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = (int)HttpStatusCode.OK,
                Message = message,
                Data = data
            };
        }

        /// <summary>
        /// Creates a failed response
        /// </summary>
        /// <param name="message">Error message</param>
        /// <param name="statusCode">HTTP status code</param>
        /// <param name="errorCode">Optional application-specific error code</param>
        /// <returns>ApiResponse with failure status</returns>
        public static ApiResponse<T> Fail(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest, string errorCode = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = (int)statusCode,
                Message = message,
                ErrorCode = errorCode,
                Data = default
            };
        }
    }
}