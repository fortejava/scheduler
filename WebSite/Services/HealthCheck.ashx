<%@ WebHandler Language="C#" Class="HealthCheck" %>

using System;
using System.Web;
using System.Data.SqlClient;
using System.Data.Entity.Core.EntityClient;
using System.Configuration;
using Newtonsoft.Json;

/// <summary>
/// Health Check Endpoint for Loginet Invoice Management System
///
/// Purpose:
///   - Verify application is running
///   - Check database connectivity
///   - Return status for monitoring systems, load balancers, Docker health checks
///
/// URL: /Services/HealthCheck.ashx
///
/// Response:
///   HTTP 200: System healthy
///   HTTP 503: System unhealthy
///
/// JSON Response:
///   {
///       "status": "healthy" | "unhealthy",
///       "timestamp": "2025-11-21T10:30:00Z",
///       "checks": {
///           "application": "ok" | "fail",
///           "database": "ok" | "fail"
///       },
///       "version": "2.0",
///       "message": "Optional status message"
///   }
///
/// Usage:
///   - Docker health check: HEALTHCHECK CMD powershell Invoke-WebRequest http://localhost/Services/HealthCheck.ashx
///   - Load balancer probe: Configure to check /Services/HealthCheck.ashx every 30s
///   - Monitoring: Poll endpoint and alert on non-200 response
///
/// </summary>
public class HealthCheck : IHttpHandler
{
    // Application version
    private const string APP_VERSION = "2.0";

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";

        try
        {
            // Health check result object
            var healthStatus = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                checks = new
                {
                    application = "ok",
                    database = "ok"
                },
                version = APP_VERSION,
                message = "All systems operational"
            };

            // HEALTH CHECK 1: Application Status
            // If we reach this point, application is running
            bool appHealthy = true;

            // HEALTH CHECK 2: Database Connectivity
            bool dbHealthy = CheckDatabaseHealth();

            // Determine overall health
            bool isHealthy = appHealthy && dbHealthy;

            // Build response
            var response = new
            {
                status = isHealthy ? "healthy" : "unhealthy",
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                checks = new
                {
                    application = appHealthy ? "ok" : "fail",
                    database = dbHealthy ? "ok" : "fail"
                },
                version = APP_VERSION,
                message = isHealthy ? "All systems operational" : "Some systems are unavailable"
            };

            // Set HTTP status code
            context.Response.StatusCode = isHealthy ? 200 : 503;

            // Serialize and return JSON
            string json = JsonConvert.SerializeObject(response, Formatting.Indented);
            context.Response.Write(json);
        }
        catch (Exception ex)
        {
            // If health check itself fails, return unhealthy status
            context.Response.StatusCode = 503;

            var errorResponse = new
            {
                status = "unhealthy",
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                checks = new
                {
                    application = "fail",
                    database = "unknown"
                },
                version = APP_VERSION,
                message = "Health check failed: " + ex.Message
            };

            string json = JsonConvert.SerializeObject(errorResponse, Formatting.Indented);
            context.Response.Write(json);
        }
    }

    /// <summary>
    /// Check database health by attempting to open a connection and execute a simple query
    /// </summary>
    /// <returns>True if database is healthy, false otherwise</returns>
    private bool CheckDatabaseHealth()
    {
        try
        {
            // Get connection string from Web.config
            var connStringSettings = ConfigurationManager.ConnectionStrings["schedulerEntities"];

            if (connStringSettings == null || string.IsNullOrEmpty(connStringSettings.ConnectionString))
            {
                // Connection string not configured
                return false;
            }

            string connectionString = connStringSettings.ConnectionString;

            // Entity Framework connection strings have a specific format
            // Extract the provider connection string
            var entityBuilder = new EntityConnectionStringBuilder(connectionString);
            string providerConnectionString = entityBuilder.ProviderConnectionString;

            // Test database connection
            using (var connection = new SqlConnection(providerConnectionString))
            {
                connection.Open();

                // Execute simple query to verify database is responsive
                using (var command = new SqlCommand("SELECT 1", connection))
                {
                    command.CommandTimeout = 5; // 5 second timeout
                    var result = command.ExecuteScalar();

                    // If we got here, database is healthy
                    return result != null;
                }
            }
        }
        catch (Exception)
        {
            // Any exception means database is not healthy
            // We don't throw because we want to return a proper health status
            return false;
        }
    }

    public bool IsReusable
    {
        get { return true; }
    }
}
