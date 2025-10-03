using System;
using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.File
{
    public class FileDto
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public string MimeType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;

        public string? ReferenceId { get; set; }

        public string? ReferenceType { get; set; }

        public string? Container { get; set; }

        public bool IsPublic { get; set; }

        public string UploadedByName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }

    public class FileUploadDto
    {
        public string? ReferenceId { get; set; }

        public string? ReferenceType { get; set; }

        public bool IsPublic { get; set; } = false;
    }

    public class FileUpdateDto
    {
        [Required]
        public Guid Id { get; set; }

        public string? FileName { get; set; }

        public string? ReferenceId { get; set; }

        public string? ReferenceType { get; set; }

        public bool? IsPublic { get; set; }
    }

    public class FileFilterDto
    {
        public string? ReferenceType { get; set; }

        public string? SearchTerm { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}