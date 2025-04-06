namespace Pluteo.Domain.Dto;
public class ExceptionResponse
{
    public required string Name { get; set; }
    public required string ClassName { get; set; }
    public required string Method { get; set; }
    public required string Message { get; set; }
    public required string StackTrace { get; set; }
}
