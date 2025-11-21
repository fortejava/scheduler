<%@ WebHandler Language="C#" Class="ExportInvoicesCSV" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DBEngine;

/// <summary>
/// Export filtered invoices to CSV format (backend generation)
///
/// Authorization: ValidToken (all authenticated users can export)
/// Restrictions: Non-admin users limited to 100 invoices per export
///
/// Request Parameters:
/// - token (string): Authentication token
/// - invoiceIds (string): Comma-separated invoice IDs (e.g., "1,2,3,4,5")
///
/// Response: Binary CSV file (direct download)
/// - Content-Type: text/csv; charset=utf-8
/// - Content-Disposition: attachment; filename=fatture_YYYYMMDD_HHMMSS.csv
///
/// CSV Format:
/// - Separator: Comma (international standard)
/// - Encoding: UTF-8 with BOM
/// - Decimal format: Dot (0.00)
/// - Date format: YYYY-MM-DD
/// - Columns: N° Fattura, N° Ordine, Cliente, Data Immissione, Data Scadenza, Stato, Imponibile, IVA, Totale
///
/// Author: Loginet Team
/// Created: November 2025
/// </summary>
public class ExportInvoicesCSV : BaseHandler
{
    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Maximum invoices per export for non-admin users
    /// Admins (RoleID=1) can export unlimited invoices
    /// </summary>
    private const int MAX_INVOICES_NON_ADMIN = 100;

    // ═══════════════════════════════════════════════════════════════════
    // AUTHORIZATION
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Requires valid authentication token
    /// All authenticated users can export (admin check done per request)
    /// </summary>
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MAIN LOGIC
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Execute CSV export operation
    /// </summary>
    /// <param name="context">HTTP context</param>
    /// <returns>null (Response already sent as binary stream)</returns>
    protected override object ExecuteOperation(HttpContext context)
    {
        try
        {
            // STEP 0: Get token and validate to access user info
            // BaseHandler already validated token, but we need tokenInfo for role checks and logging
            string token = context.Request.Form["token"];
            SimpleTokenManager.TokenInfo tokenInfo;
            if (!SimpleTokenManager.ValidateToken(token, out tokenInfo))
            {
                throw new ServiceException("Token non valido o scaduto");
            }

            // STEP 1: Parse invoice IDs from request
            string idsParam = context.Request.Form["invoiceIds"];
            List<int> invoiceIds = ParseInvoiceIds(idsParam);

            // STEP 2: Validate invoice IDs
            if (invoiceIds.Count == 0)
            {
                throw new ServiceException("Nessuna fattura selezionata per l'esportazione");
            }

            // STEP 3: Check bulk export restriction (admin-only for > 100 invoices)
            if (invoiceIds.Count > MAX_INVOICES_NON_ADMIN)
            {
                // Check if user is admin
                if (!AuthorizationHelper.IsAdmin(tokenInfo))
                {
                    throw new ServiceException(
                        string.Format("Solo gli amministratori possono esportare più di {0} fatture contemporaneamente. Hai selezionato {1} fatture.",
                            MAX_INVOICES_NON_ADMIN, invoiceIds.Count)
                    );
                }
            }

            // STEP 4: Fetch invoices from database
            List<InvoiceDTO> invoices = FetchInvoices(invoiceIds);

            // STEP 5: Validate fetched invoices
            if (invoices.Count == 0)
            {
                throw new ServiceException("Nessuna fattura trovata con gli ID specificati");
            }

            // STEP 6: Log warning if some invoices not found (but continue with found ones)
            if (invoices.Count != invoiceIds.Count)
            {
                int missingCount = invoiceIds.Count - invoices.Count;
                DiagnosticLogger.Warning(
                    string.Format("Export CSV: User {0} requested {1} invoices, but only {2} found. Missing: {3} invoices.",
                        tokenInfo.Username, invoiceIds.Count, invoices.Count, missingCount)
                );
            }

            // STEP 7: Generate CSV bytes
            byte[] csvBytes = ExportService.GenerateCSV(invoices);

            // STEP 8: Generate filename with timestamp
            string filename = string.Format("fatture_{0}.csv", DateTime.Now.ToString("yyyyMMdd_HHmmss"));

            // STEP 9: Stream CSV to response (direct download)
            context.Response.Clear();
            context.Response.ContentType = "text/csv; charset=utf-8";
            context.Response.AddHeader("Content-Disposition", string.Format("attachment; filename=\"{0}\"", filename));
            context.Response.AddHeader("Content-Length", csvBytes.Length.ToString());
            context.Response.BinaryWrite(csvBytes);
            context.Response.Flush();

            // ✅ IMPORTANT: Throw HttpResponseEndedException to signal BaseHandler
            // that response has been sent and headers written.
            // BaseHandler will catch this and exit gracefully without calling SendResponse()
            // which would cause "Server cannot set content type after HTTP headers have been sent" error.
            //
            // WHY NOT Response.End()?
            // Response.End() throws ThreadAbortException which is expensive and pollutes logs.
            // This custom exception is cleaner and more explicit about intent.
            throw new HttpResponseEndedException();

            // NOTE: Code below is unreachable (HttpResponseEndedException thrown above)
            // Kept for documentation purposes

            // STEP 10: Audit logging (FUTURE - currently commented out)
            // Uncomment when audit logging system is fully implemented
            /*
            DiagnosticLogger.LogInfo(
                string.Format("EXPORT: User={0}, Format=CSV, Count={1}, Requested={2}, Timestamp={3}",
                    tokenInfo.Username, invoices.Count, invoiceIds.Count, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"))
            );
            */
        }
        catch (Exception)
        {
            // Let BaseHandler handle exceptions (ValidationException, ServiceException, etc.)
            // BaseHandler will send proper error response to client
            throw;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Parse comma-separated invoice IDs from string
    /// </summary>
    /// <param name="idsParam">Comma-separated IDs (e.g., "1,2,3,4,5")</param>
    /// <returns>List of invoice IDs</returns>
    /// <exception cref="ServiceException">If parsing fails</exception>
    private List<int> ParseInvoiceIds(string idsParam)
    {
        var ids = new List<int>();

        if (string.IsNullOrWhiteSpace(idsParam))
        {
            return ids; // Empty list
        }

        try
        {
            // Split by comma and parse each ID
            string[] parts = idsParam.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string part in parts)
            {
                string trimmed = part.Trim();
                if (!string.IsNullOrEmpty(trimmed))
                {
                    int id = int.Parse(trimmed);
                    if (id > 0) // Only positive IDs
                    {
                        ids.Add(id);
                    }
                }
            }

            return ids;
        }
        catch (FormatException)
        {
            throw new ServiceException("Formato ID fatture non valido. Atteso: numeri separati da virgola.");
        }
        catch (OverflowException)
        {
            throw new ServiceException("ID fattura troppo grande. Verificare i dati.");
        }
    }

    /// <summary>
    /// Fetch invoices by IDs
    /// Only returns active invoices (InvoiceActive='Y')
    /// </summary>
    /// <param name="invoiceIds">List of invoice IDs</param>
    /// <returns>List of InvoiceDTO objects</returns>
    // FUTURE: Signature with tokenInfo parameter for logging/auditing
    // private List<InvoiceDTO> FetchInvoices(List<int> invoiceIds, SimpleTokenManager.TokenInfo tokenInfo)
    private List<InvoiceDTO> FetchInvoices(List<int> invoiceIds)
    {
        var invoices = new List<InvoiceDTO>();

        // NOTE: InvoicesService.GetByIds() does not exist yet
        // For now, fetch each invoice individually (acceptable for < 1000 invoices)
        // TODO FUTURE: Add InvoicesService.GetByIds(List<int>) for better performance

        foreach (int id in invoiceIds)
        {
            try
            {
                InvoiceDTO dto = InvoicesService.GetByIdDTO(id);

                // Only include active invoices (security check)
                if (dto != null && dto.Invoice.InvoiceActive == "Y")
                {
                    invoices.Add(dto);
                }
                // FUTURE: Uncomment when logging is needed (requires tokenInfo parameter)
                /*
                else if (dto != null && dto.Invoice.InvoiceActive != "Y")
                {
                    // Log attempt to export deleted invoice (potential security issue)
                    DiagnosticLogger.Warning(
                        string.Format("Export CSV: User {0} attempted to export deleted invoice ID {1} (InvoiceActive='{2}')",
                            tokenInfo.Username, id, dto.Invoice.InvoiceActive)
                    );
                }
                */
            }
            catch (Exception)
            {
                // FUTURE: Uncomment when logging is needed
                /*
                // Log error but continue with other invoices
                DiagnosticLogger.Warning(
                    string.Format("Export CSV: Failed to fetch invoice ID {0}: {1}", id, ex.Message)
                );
                */
                // Silently skip invoices that cannot be fetched (continue with others)
            }
        }

        return invoices;
    }
}
