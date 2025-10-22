using DBEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for CustomersService
/// </summary>
public class CustomersService
{
    public static bool CreateCustomer(string customerName)
    {
        bool result = false;
        var db = new schedulerEntities();
        if(!db.Customers.Any(p=>p.CustomerName == customerName))
        {
            Customer customer = new Customer();
            customer.CustomerName = customerName;
            db.Customers.Add(customer);
            db.SaveChanges();
            result = true;
        }
        return result;


    }
}