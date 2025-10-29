using DBEngine;
using System;
using System.Collections.Generic;
using System.IdentityModel.Protocols.WSTrust;
using System.Linq;
using System.Web;
using Status = DBEngine.Status;

/// <summary>
/// Summary description for StatusesService
/// </summary>
public class StatusesService
{
    public static List<Status> GetAllStatuses(bool LazyLoading = false, 
        bool ProxyLoading = false)
    {
        var statusesFound = new List<Status>();
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = ProxyLoading;
            db.Configuration.LazyLoadingEnabled = LazyLoading;
            statusesFound = db.Status.AsNoTracking()
                .ToList();
        }
        return statusesFound;
    }

    public static Status GetStatusById(int StatusId, 
        bool LazyLoading = false, bool ProxyLoading = false)
    {
        var status = new Status();
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = ProxyLoading;
            db.Configuration.LazyLoadingEnabled = LazyLoading;
            status = db.Status.AsNoTracking()
                .Where(s => s.StatusID == StatusId)
                .FirstOrDefault();
        }
        return status;
    }

    public static Status GetStatusByName(string StatusName, 
        bool LazyLoading = false, bool ProxyLoading = false)
    {
        var status = new Status();
        using(var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = ProxyLoading;
            db.Configuration.LazyLoadingEnabled = LazyLoading;
            status = db.Status.AsNoTracking()
                .Where(s => s.StatusLabel == StatusName)
                .FirstOrDefault();
        }
        return status;
    }
}
