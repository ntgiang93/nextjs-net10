using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Model.Entities.System;

namespace Model.DTOs.System.Auth
{
    public class RevokeTokenDto
    {
        public List<string> DeviceIds { get; set; }
    }
}
