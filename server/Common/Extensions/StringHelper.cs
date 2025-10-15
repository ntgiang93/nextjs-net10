using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
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

    /// <summary>
    /// Gets the database table name for the specified entity type.
    /// First checks for [Table] attribute, if found returns the attribute's Name property.
    /// If no [Table] attribute is found, returns the entity class name.
    /// </summary>
    /// <typeparam name="TEntity">The entity type to get table name for</typeparam>
    /// <returns>
    /// The database table name. Returns the value from [Table(Name = "TableName")] attribute 
    /// if present, otherwise returns the entity class name.
    /// </returns>
    /// <example>
    /// <code>
    /// // For entity with [Table("Users")] attribute
    /// string tableName = StringHelper.GetTableName&lt;User&gt;(); // Returns "Users"
    /// 
    /// // For entity without [Table] attribute  
    /// string tableName = StringHelper.GetTableName&lt;Product&gt;(); // Returns "Product"
    /// </code>
    /// </example>
    public static string GetTableName<TEntity>()
    {
        // Lấy Type của TEntity
        Type entityType = typeof(TEntity);

        // Tìm TableAttribute trên Type đó
        var tableAttribute = entityType.GetCustomAttribute<TableAttribute>();

        if (tableAttribute != null && !string.IsNullOrWhiteSpace(tableAttribute.Name))
        {
            // Nếu có TableAttribute và Name được set, trả về Name đó
            return tableAttribute.Name;
        }
        else
        {
            return entityType.Name;
        }
    }

    // Plan:
    // - If length <= 0, return empty string.
    // - Define allowed characters (A-Z, a-z, 0-9).
    // - Use string.Create to allocate the exact length.
    // - For each position, pick a cryptographically strong random index using
    //   System.Security.Cryptography.RandomNumberGenerator.GetInt32(charset.Length).
    // - Assign the character to the span and return the result.
    public static string GenerateRandomString(int length)
    {
        if (length <= 0)
            return string.Empty;

        const string charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return string.Create(length, charset, (span, chars) =>
        {
            for (int i = 0; i < span.Length; i++)
            {
                int idx = System.Security.Cryptography.RandomNumberGenerator.GetInt32(chars.Length);
                span[i] = chars[idx];
            }
        });
    }
}
