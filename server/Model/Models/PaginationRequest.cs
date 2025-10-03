namespace Model.Models;

public class PaginationRequest
{
    public string? SearchTerm { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}