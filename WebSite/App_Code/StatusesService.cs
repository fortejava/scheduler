using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DBEngine;

/// <summary>
/// Summary description for StatusesService
/// </summary>
public class StatusesService
{
    public static List<Status> GetAllStatuses(bool lazyLoading)
    {
        var statusesFound = new List<Status>();
        using (var db = new schedulerEntities())
        {
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            statusesFound = db.Status.ToList();
        }
        return statusesFound;
    }
}


//if (lazyLoading)
//{
//    db.Configuration.LazyLoadingEnabled = lazyLoading;
//}