using System.Collections.Generic;
using Common.Security;
using Model.Constants;
using Service.Interfaces.Base;

namespace Service.Services.Base;

public class SysMessageService : ISysMessageService
{
    public string Get(EMessage key)
    {
        //get language from UserContext
        var languageCode = UserContext.Current?.Language;

        if (MessageList.MessageDictionary.TryGetValue(key, out var translations))
            switch (languageCode)
            {
                case "en":
                    return translations.English;
                case "vi":
                    return translations.Vietnamese;
                default:
                    return translations.Vietnamese;
            }

        return $"[{key.ToString()}]";
    }
}