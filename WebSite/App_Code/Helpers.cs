using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

/// <summary>
/// Summary description for Helpers
/// </summary>
public class Helpers
{
    public static bool IsNotEmpty(string message)
    {
        return !string.IsNullOrEmpty(message) && message != "null";
    }

    public static bool IsNotEmpty(decimal num)
    {
        return num > 0;
    }

    public static bool IsNotEmpty(DateTime data)
    {
        return data != new DateTime(1800, 01, 01);
    }

    public static bool AreNotEmpty(params string[] strings)
    {
        return strings.All(s => !string.IsNullOrWhiteSpace(s));
    }
    public static bool AreNotEmpty(params decimal[] decimals)
    {
        return decimals.All(d => (d!=-1));
    }

    public static bool ValidYear(int Year)
    {
        return (Year >= 2000 && Year <= 2100);
    }

    public static bool ValidMonth(int Month)
    {
        return (Month >= 1 && Month <= 12);
    }

    public static JsonSerializerSettings JsonSettings()
    {
        var jsonSettings = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        };

        return jsonSettings;
    }

    public static string JsonSerialize(Response r)
    {
        return JsonConvert.SerializeObject(r, Helpers.JsonSettings());
    }

    public static string HashString(string input)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = sha256.ComputeHash(inputBytes);

            // Convert to hexadecimal string
            return BitConverter.ToString(hashBytes).Replace("-", "");
        }
    }

    public static string Paid = "Saldato";
    public static string NotPaid = "Non Saldato";
}