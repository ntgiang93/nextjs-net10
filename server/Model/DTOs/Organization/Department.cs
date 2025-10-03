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

        public string DepartmentTypeCode { get; set; }

        public string DepartmentTypeName { get; set; } = string.Empty;

        public int DepartmentTypeLevel { get; set; }

        public int? ParentId { get; set; }

        public bool IsActive { get; set; }

        public int DisplayOrder { get; set; }

        public string? ContactInfo { get; set; }

        public string? Address { get; set; }

        public Guid? ManagerId { get; set; }

        public string? ManagerName { get; set; }

        public List<DepartmentDto>? Children { get; set; }
    }

    public class CreateDepartmentDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(30)]
        public string DepartmentTypeCode { get; set; }

        public int? ParentId { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; }

        [StringLength(500)]
        public string? ContactInfo { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        public Guid? ManagerId { get; set; }
    }

    public class UpdateDepartmentDto : CreateDepartmentDto
    {
        [Required]
        public int Id { get; set; }
    }

    public class DepartmentTreeFilterDto
    {
        public string? DepartmentTypeCode { get; set; }
        public string? SearchTerm { get; set; }
    }

    public class TableDepartmentDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;
        public string DepartmentTypeName { get; set; } = string.Empty;
        public string DepartmentTypeCode { get; set; }
        public int ParentId { get; set; }
        public string? ContactInfo { get; set; }
        public string? ManagerName { get; set; }
        [StringLength(200)]
        public string? Address { get; set; }
        public List<TableDepartmentDto>? Children { get; set; }
    }
}
