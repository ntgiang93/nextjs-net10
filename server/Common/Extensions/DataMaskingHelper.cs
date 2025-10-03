public static class DataMaskingHelper
{
    public static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 7)
            return phone;

        return $"{phone[..3]}****{phone[^3..]}";
    }

    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return email;

        var parts = email.Split('@');
        var name = parts[0];
        var domain = parts[1];

        var visible = name.Length <= 2 ? name[..1] : name[..3];
        return $"{visible}****@{domain}";
    }
}
