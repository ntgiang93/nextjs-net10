// server/Model/DTOs/Base/CursorPaginatedResultDto.cs
namespace Model.DTOs.Base;

public class CursorPaginatedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int? NextCursor { get; set; }
    public bool HasMore { get; set; }
}