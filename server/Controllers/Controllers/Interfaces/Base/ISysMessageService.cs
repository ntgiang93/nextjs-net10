using System.Collections.Generic;
using Model.Constants;

namespace Service.Interfaces.Base;

public interface ISysMessageService
{
    string Get(EMessage key);
    List<string> GetSupportLanguage();
}