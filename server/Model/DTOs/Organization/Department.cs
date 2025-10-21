using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.Organization
{
    public class DepartmentDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string DepartmentTypeCode { get; set; } = string.Empty;

        public string DepartmentTypeName { get; set; } = string.Empty;

        public int? ParentId { get; set; }

        public string? Address { get; set; }

        public List<DepartmentDto>? Children { get; set; }
    }

    public class DetailDepartmentDto
    {
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        [Required]
        [StringLength(50)]
        public required string Code { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(30)]
        public required string DepartmentTypeCode { get; set; }

        public int ParentId { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }
        public required string TreePath { get; set; }

    }

    public class DepartmentTreeFilterDto
    {
        public string? DepartmentTypeCode { get; set; }
        public string? SearchTerm { get; set; }
    }
}
