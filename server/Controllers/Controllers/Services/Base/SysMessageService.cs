using System.Collections.Generic;
using Common.Security;
using Model.Constants;
using Service.Interfaces.Base;

namespace Service.Services.Base;

public class SysMessageService : ISysMessageService
{
    private readonly List<string> _supportLanguage = new() { "vi-VN", "en-US" };

    public string Get(EMessage key)
    {
        //get language from UserContext
        var languageCode = UserContext.Current?.Language;

        if (MessageList.MessageDictionary.TryGetValue(key, out var translations))
            switch (languageCode)
            {
                case "en-US":
                    return translations.English;
                case "vi-VN":
                    return translations.Vietnamese;
                default:
                    return translations.Vietnamese;
            }

        return $"[{key.ToString()}]";
    }

    public List<string> GetSupportLanguage()
    {
        return _supportLanguage;
    }
}