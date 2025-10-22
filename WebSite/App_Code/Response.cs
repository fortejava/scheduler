using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Response
/// </summary>
public class Response
{
    public string Code { get; set; }
    public object Message { get; set; }
    public Response(string code, object message)
    {
        Code = code;
        Message = message;
    }
}