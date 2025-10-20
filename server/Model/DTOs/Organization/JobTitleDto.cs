using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.DTOs.Organization
{
    public class JobTitleDto
    {
        public int Id { get; set; }
        [Required][StringLength(50)] public string Code { get; set; }

        [Required][StringLength(200)] public string Name { get; set; }

        [StringLength(500)] public string Description { get; set; }
    }
}
