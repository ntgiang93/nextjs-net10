namespace Model.Models;

public class SelectOption<TKey>
{
    public required TKey Value { get; set; }
    public required string Label { get; set; }
}