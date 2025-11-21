<%@ WebHandler Language="C#" Class="ExportInvoicesPDF" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DBEngine;

/// <summary>
/// PLACEHOLDER: PDF export functionality (Phase 3)
///
/// Current Status: 🚧 IN DEVELOPMENT
/// Returns ServiceException with "Funzionalità in sviluppo" message
/// Frontend displays info popup instead of downloading file
///
/// TO ACTIVATE (Phase 3):
/// 1. Install PDFsharp NuGet package:
///    Install-Package PdfSharp -Version 6.2.0
///
/// 2. Add to DBEngine/packages.config:
///    <package id="PdfSharp" version="6.2.0" targetFramework="net472" />
///
/// 3. Add to DBEngine/DBEngine.csproj (ItemGroup/Reference):
///    <Reference Include="PdfSharp">
///      <HintPath>..\packages\PdfSharp.6.2.0\lib\net6.0\PdfSharp.dll</HintPath>
///    </Reference>
///
/// 4. Rebuild solution
///
/// 5. Uncomment implementation code below
///
/// 6. Update Index.html dropdown badge from "In sviluppo" to "Disponibile"
///
/// Author: Loginet Team
/// Created: November 2025
/// </summary>
public class ExportInvoicesPDF : BaseHandler
{
    // ═══════════════════════════════════════════════════════════════════
    // AUTHORIZATION
    // ═══════════════════════════════════════════════════════════════════

    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1: STUB IMPLEMENTATION
    // Returns "in sviluppo" message to frontend
    // ═══════════════════════════════════════════════════════════════════

    protected override object ExecuteOperation(HttpContext context)
    {
        // PHASE 1: Return development message
        // Frontend will catch this ServiceException and display info popup
        throw new ServiceException(
            "Funzionalità in sviluppo. L'esportazione PDF sarà disponibile a breve. " +
            "Utilizza l'esportazione CSV per ora."
        );
    }


    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3: FULL IMPLEMENTATION (COMMENTED OUT)
    // Uncomment when PDFsharp NuGet package is installed
    // ═══════════════════════════════════════════════════════════════════

    /*
    private const int MAX_INVOICES_NON_ADMIN = 100;

    protected override object ExecuteOperation(HttpContext context)
    {
        try
        {
            // STEP 0: Get token and validate to access user info
            string token = context.Request.Form["token"];
            SimpleTokenManager.TokenInfo tokenInfo;
            if (!SimpleTokenManager.ValidateToken(token, out tokenInfo))
            {
                throw new ServiceException("Token non valido o scaduto");
            }

            // STEP 1: Parse invoice IDs
            string idsParam = context.Request.Form["invoiceIds"];
            List<int> invoiceIds = ParseInvoiceIds(idsParam);

            // STEP 2: Validate
            if (invoiceIds.Count == 0)
            {
                throw new ServiceException("Nessuna fattura selezionata per l'esportazione");
            }

            // STEP 3: Check bulk export restriction
            if (invoiceIds.Count > MAX_INVOICES_NON_ADMIN)
            {
                if (!AuthorizationHelper.IsAdmin(tokenInfo))
                {
                    throw new ServiceException(
                        string.Format("Solo gli amministratori possono esportare più di {0} fatture", MAX_INVOICES_NON_ADMIN)
                    );
                }
            }

            // STEP 4: Fetch invoices
            List<InvoiceDTO> invoices = FetchInvoices(invoiceIds);

            if (invoices.Count == 0)
            {
                throw new ServiceException("Nessuna fattura trovata");
            }

            // STEP 5: Generate PDF
            byte[] pdfBytes = ExportService.GeneratePDF(invoices);

            // STEP 6: Generate filename
            string filename = string.Format("fatture_{0}.pdf", DateTime.Now.ToString("yyyyMMdd_HHmmss"));

            // STEP 7: Stream PDF to response
            context.Response.Clear();
            context.Response.ContentType = "application/pdf";
            context.Response.AddHeader("Content-Disposition", string.Format("attachment; filename=\"{0}\"", filename));
            context.Response.AddHeader("Content-Length", pdfBytes.Length.ToString());
            context.Response.BinaryWrite(pdfBytes);
            context.Response.Flush();
            context.Response.End();

            // STEP 8: Audit logging (uncomment when ready)
            // DiagnosticLogger.LogInfo(string.Format("EXPORT: User={0}, Format=PDF, Count={1}", tokenInfo.Username, invoices.Count));

            return null;
        }
        catch (Exception)
        {
            throw;
        }
    }

    // Helper methods (copy from ExportInvoicesCSV.ashx)
    private List<int> ParseInvoiceIds(string idsParam)
    {
        var ids = new List<int>();
        if (string.IsNullOrWhiteSpace(idsParam)) return ids;

        try
        {
            string[] parts = idsParam.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (string part in parts)
            {
                string trimmed = part.Trim();
                if (!string.IsNullOrEmpty(trimmed))
                {
                    int id = int.Parse(trimmed);
                    if (id > 0) ids.Add(id);
                }
            }
            return ids;
        }
        catch (FormatException)
        {
            throw new ServiceException("Formato ID non valido");
        }
    }

    private List<InvoiceDTO> FetchInvoices(List<int> invoiceIds)
    {
        var invoices = new List<InvoiceDTO>();
        foreach (int id in invoiceIds)
        {
            try
            {
                InvoiceDTO dto = InvoicesService.GetByIdDTO(id);
                if (dto != null && dto.Invoice.InvoiceActive == "Y")
                {
                    invoices.Add(dto);
                }
            }
            catch (Exception ex)
            {
                DiagnosticLogger.Warning(string.Format("Failed to fetch invoice {0}: {1}", id, ex.Message));
            }
        }
        return invoices;
    }
    */
}
