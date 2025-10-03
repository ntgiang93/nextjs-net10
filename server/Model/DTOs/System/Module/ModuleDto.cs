using System;

namespace Model.DTOs.System.Module
{
    /// <summary>
    /// Data transfer object for basic module information
    /// </summary>
    public class ModuleDto
    {
        /// <summary>
        /// The unique name/identifier of the module
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Human-readable description of the module's purpose and functionality
        /// </summary>
        public string Description { get; set; }
    }
}