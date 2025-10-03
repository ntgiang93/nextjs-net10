using System;
using System.Text;

namespace Common.Extensions;

public static class StringHelper
{
    /// <summary>
    /// Gets the first character of each word in a string, removes Vietnamese diacritics and converts to lowercase
    /// </summary>
    /// <param name="input">Input string. Example: "Nguyễn Văn Trường"</param>
    /// <returns>String containing first character of each word. Example: "nvt"</returns>
    public static string GetInitials(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Split string into words
        var words = input.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

        // Get first character of each word
        var initials = words.Select(word => word.Length > 0 ? word[0].ToString().ToLower() : string.Empty);

        // Join characters and remove diacritics
        string result = string.Join("", initials);
        return RemoveDiacritics(result);
    }

    /// <summary>
    /// Gets the first character of the last N words in a string
    /// Example: "Nguyễn Văn" -> "nv", "Nguyễn Trường" -> "nt"
    /// </summary>
    /// <param name="input">Input string</param>
    /// <param name="wordCount">Number of last words to use</param>
    /// <returns>String containing first character of the last N words</returns>
    public static string GetLastWordsInitials(this string input, int wordCount = 2)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Split string into words
        var words = input.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

        // Get the specified number of last words
        var lastWords = words.Length <= wordCount
            ? words
            : words.Skip(words.Length - wordCount).Take(wordCount);

        // Get first character of each word
        var initials = lastWords.Select(word => word.Length > 0 ? word[0].ToString().ToLower() : string.Empty);

        // Join characters and remove diacritics
        string result = string.Join("", initials);
        return RemoveDiacritics(result);
    }

    /// <summary>
    /// Removes Vietnamese diacritics from a string
    /// </summary>
    /// <param name="text">String with diacritics</param>
    /// <returns>String without diacritics</returns>
    public static string RemoveDiacritics(this string text)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
}
