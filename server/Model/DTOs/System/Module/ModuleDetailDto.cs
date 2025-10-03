using System;
using System.Collections.Generic;

namespace Model.DTOs.System.Module
{
    /// <summary>
    /// Data transfer object for detailed module information including permissions
    /// </summary>
    public class ModuleDetailDto
    {
        /// <summary>
        /// The unique name/identifier of the module
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Human-readable description of the module's purpose and functionality
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// List of permission objects available for this module
        /// </summary>
        public List<PermissionDto> Permissions { get; set; }
    }

    /// <summary>
    /// Data transfer object for permission information
    /// </summary>
    public class PermissionDto
    {
        /// <summary>
        /// The permission identifier in format "Module.Permission"
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Human-readable description of what the permission allows
        /// </summary>
        public string Description { get; set; }
    }
}