using Model.Constants;
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.DTOs.System.Module
{
    public class ModulePermissionDto
    {
        public required string Module { get; set; }
        public EPermission Permission { get; set; }
    }
}
