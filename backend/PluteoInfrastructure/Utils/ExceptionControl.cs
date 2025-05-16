using System.Diagnostics;
using Pluteo.Domain.Models.Dto;
using ILogger = Serilog.ILogger;

namespace Pluteo.Infrastructure.Utils;
public static class ExceptionControl
{
    /// <summary>
    /// Processes an exception and logs it.
    /// </summary>
    /// <param name="e"></param>
    /// <param name="logger"></param>
    /// <param name="isDevelopment"></param>
    /// <param name="isWarning"></param>
    /// <returns></returns>
    public static ExceptionResponse ProcessException(Exception e, ILogger logger, bool isDevelopment, bool isWarning) 
    {
        StackTrace trace = new(e, true);
        
        StackFrame? frame = trace.GetFrame(0);
        
        var method = frame?.GetMethod();

        string? methodName = isDevelopment ? method?.Name : "See server log";

        string? className = isDevelopment ? method?.DeclaringType?.FullName : "See server log";

        ExceptionResponse response = new()
        {
            Name = e.GetType().Name,
            ClassName = className ?? "Unknown",
            Method = methodName ?? "Unknown",
            Message = e.Message,
            StackTrace = isDevelopment ? e.StackTrace ?? "No stack trace available" : "See server log"
        };

        if(isWarning)
            logger.Warning("Exception: {Name}. Class: {ClassName}. Method: {Method}. Message: {Message}", response.Name, response.ClassName, response.Method, response.Message);
        else
            logger.Error(e, "Exception: {Name}. Class: {ClassName}. Method: {Method}. Message: {Message}", response.Name, response.ClassName, response.Method, response.Message);
        
        return response;
    }
}
