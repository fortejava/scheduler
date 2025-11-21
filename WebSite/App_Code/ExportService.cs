using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using DBEngine;

/// <summary>
/// Export service for generating CSV, Excel, and PDF files from invoice data.
///
/// PHASE 1: CSV fully implemented (✅ FUNCTIONAL)
/// PHASE 2: Excel prepared (commented out - requires ClosedXML NuGet package)
/// PHASE 3: PDF prepared (commented out - requires PDFsharp NuGet package)
///
/// Author: Loginet Team
/// Created: November 2025
/// </summary>
public static class ExportService
{
    // ═══════════════════════════════════════════════════════════════════
    // CSV EXPORT - ✅ FULLY FUNCTIONAL
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Generate CSV file from invoice data
    /// Format: International standard (comma separator, dot decimal, UTF-16 LE with BOM)
    /// Columns: N° Fattura, N° Ordine, Cliente, Data Immissione, Data Scadenza, Stato, Imponibile, IVA, Totale
    ///
    /// ENCODING: UTF-16 LE (Little Endian) with BOM
    /// WHY NOT UTF-8?: Excel on Windows often ignores UTF-8 BOM and defaults to Windows-1252,
    /// causing character corruption: "N° Fattura" → "NÂ° Fattura" (º = 0xC2 0xBA in UTF-8)
    /// WHY UTF-16 LE?: Excel ALWAYS recognizes UTF-16 LE BOM (FF FE) correctly.
    /// TRADEOFF: File size doubles (~2KB vs ~1KB for 10 invoices) - negligible for typical exports.
    /// </summary>
    /// <param name="invoices">List of invoices to export</param>
    /// <returns>UTF-16 LE encoded CSV bytes (with BOM for Excel compatibility)</returns>
    public static byte[] GenerateCSV(List<InvoiceDTO> invoices)
    {
        if (invoices == null || invoices.Count == 0)
        {
            throw new ServiceException("Nessuna fattura da esportare");
        }

        var csv = new StringBuilder();

        // Header row (9 columns)
        csv.AppendLine("N° Fattura,N° Ordine,Cliente,Data Immissione,Data Scadenza,Stato,Imponibile,IVA,Totale");

        // Data rows
        foreach (var dto in invoices)
        {
            var inv = dto.Invoice;

            // Build row with proper formatting
            var row = string.Join(",",
                SanitizeCSV(inv.InvoiceNumber),                                    // N° Fattura
                SanitizeCSV(inv.InvoiceOrderNumber),                               // N° Ordine
                SanitizeCSV(inv.Customer.CustomerName),                            // Cliente
                FormatDateForCSV(inv.InvoiceCreationDate),                         // Data Immissione
                FormatDateForCSV(inv.InvoiceDueDate),                              // Data Scadenza
                SanitizeCSV(GetStatusDisplayString(inv)),                          // Stato (calculated)
                FormatDecimalForCSV(inv.InvoiceTaxable),                           // Imponibile
                FormatDecimalForCSV(inv.InvoiceTax),                               // IVA
                FormatDecimalForCSV(inv.InvoiceDue)                                // Totale
            );

            csv.AppendLine(row);
        }

        // Convert to UTF-16 LE with BOM (for Excel compatibility)
        // UnicodeEncoding(bigEndian: false, byteOrderMark: true)
        // - bigEndian: false = Little Endian (required for Windows/Excel)
        // - byteOrderMark: true = Include BOM (FF FE) so Excel recognizes encoding
        var encoding = new UnicodeEncoding(false, true);
        return encoding.GetBytes(csv.ToString());
    }

    /// <summary>
    /// Get status display string from invoice
    /// Maps StatusCode to Italian display string
    ///
    /// Algorithm (synchronized with InvoicesService.GetStatusCode):
    ///   - StatusCode "0" (Paid) → "Saldata"
    ///   - StatusCode "1" (Unpaid, not overdue) → "Non Saldata"
    ///   - StatusCode "2" (Overdue) → "Scaduta"
    /// </summary>
    /// <param name="invoice">Invoice entity</param>
    /// <returns>Status display string</returns>
    private static string GetStatusDisplayString(Invoice invoice)
    {
        // Reuse existing business logic from InvoicesService
        string statusCode = InvoicesService.GetStatusCode(invoice);

        switch (statusCode)
        {
            case "0":  // Paid
                return "Saldata";

            case "1":  // Unpaid, not overdue
                return "Non Saldata";

            case "2":  // Overdue
                return "Scaduta";

            default:
                return "Sconosciuto";  // Should never happen
        }
    }

    /// <summary>
    /// Sanitize CSV field value
    /// - Prevents CSV injection (formulas starting with =, +, -, @)
    /// - Escapes special characters (commas, quotes, newlines)
    /// - Returns quoted string if necessary
    /// </summary>
    /// <param name="value">Raw field value</param>
    /// <returns>Sanitized CSV field value</returns>
    private static string SanitizeCSV(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "";
        }

        // CSV INJECTION PREVENTION
        // If value starts with formula character, prepend single quote to force text interpretation
        if (value.StartsWith("=") || value.StartsWith("+") ||
            value.StartsWith("-") || value.StartsWith("@"))
        {
            value = "'" + value; // Excel will treat as text, not formula
        }

        // STANDARD CSV ESCAPING
        // If value contains comma, quote, or newline, it must be quoted and quotes must be escaped
        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n") || value.Contains("\r"))
        {
            // Escape quotes by doubling them
            value = value.Replace("\"", "\"\"");

            // Wrap in quotes
            return "\"" + value + "\"";
        }

        return value;
    }

    /// <summary>
    /// Format decimal for CSV (international format)
    /// Uses invariant culture: dot as decimal separator
    /// Format: "0.00" (always 2 decimal places)
    /// Example: 1234.56 (NOT 1234,56)
    /// </summary>
    /// <param name="value">Decimal value</param>
    /// <returns>Formatted decimal string</returns>
    private static string FormatDecimalForCSV(decimal value)
    {
        // Use invariant culture to ensure dot separator (international standard)
        return value.ToString("0.00", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Format date for CSV (ISO 8601 format)
    /// Format: YYYY-MM-DD
    /// Example: 2025-01-15
    /// </summary>
    /// <param name="date">DateTime value</param>
    /// <returns>Formatted date string</returns>
    private static string FormatDateForCSV(DateTime date)
    {
        return date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }


    // ═══════════════════════════════════════════════════════════════════
    // EXCEL EXPORT - 🚧 PHASE 2 (PREPARED, COMMENTED OUT)
    //
    // TO ACTIVATE:
    // 1. Install NuGet package: Install-Package ClosedXML -Version 0.104.1
    // 2. Add to DBEngine.csproj references section
    // 3. Add to packages.config
    // 4. Uncomment code below
    // 5. Uncomment ExportInvoicesExcel.ashx implementation
    // ═══════════════════════════════════════════════════════════════════

    /*
    using ClosedXML.Excel;

    /// <summary>
    /// Generate Excel file from invoice data (Phase 2)
    /// Requires: Install-Package ClosedXML
    /// Features: Formatted headers, colored status cells, auto-fit columns
    /// </summary>
    /// <param name="invoices">List of invoices to export</param>
    /// <returns>Excel file bytes (.xlsx)</returns>
    public static byte[] GenerateExcel(List<InvoiceDTO> invoices)
    {
        if (invoices == null || invoices.Count == 0)
        {
            throw new ServiceException("Nessuna fattura da esportare");
        }

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Fatture");

            // HEADER ROW (Row 1)
            worksheet.Cell(1, 1).Value = "N° Fattura";
            worksheet.Cell(1, 2).Value = "N° Ordine";
            worksheet.Cell(1, 3).Value = "Cliente";
            worksheet.Cell(1, 4).Value = "Data Immissione";
            worksheet.Cell(1, 5).Value = "Data Scadenza";
            worksheet.Cell(1, 6).Value = "Stato";
            worksheet.Cell(1, 7).Value = "Imponibile";
            worksheet.Cell(1, 8).Value = "IVA";
            worksheet.Cell(1, 9).Value = "Totale";

            // HEADER STYLING
            var headerRange = worksheet.Range(1, 1, 1, 9);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Font.FontSize = 11;
            headerRange.Style.Fill.BackgroundColor = XLColor.FromHex("#002C3D"); // Loginet primary color
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // DATA ROWS (starting from row 2)
            int row = 2;
            foreach (var dto in invoices)
            {
                var inv = dto.Invoice;

                worksheet.Cell(row, 1).Value = inv.InvoiceNumber;
                worksheet.Cell(row, 2).Value = inv.InvoiceOrderNumber;
                worksheet.Cell(row, 3).Value = inv.Customer.CustomerName;
                worksheet.Cell(row, 4).Value = inv.InvoiceCreationDate;
                worksheet.Cell(row, 5).Value = inv.InvoiceDueDate;
                worksheet.Cell(row, 6).Value = GetStatusDisplayString(inv);
                worksheet.Cell(row, 7).Value = inv.InvoiceTaxable;
                worksheet.Cell(row, 8).Value = inv.InvoiceTax;
                worksheet.Cell(row, 9).Value = inv.InvoiceDue;

                // FORMAT DATES
                worksheet.Cell(row, 4).Style.DateFormat.Format = "dd/mm/yyyy";
                worksheet.Cell(row, 5).Style.DateFormat.Format = "dd/mm/yyyy";

                // FORMAT CURRENCY (Imponibile, IVA, Totale)
                worksheet.Cell(row, 7).Style.NumberFormat.Format = "#,##0.00 €";
                worksheet.Cell(row, 8).Style.NumberFormat.Format = "#,##0.00 €";
                worksheet.Cell(row, 9).Style.NumberFormat.Format = "#,##0.00 €";

                // COLOR STATUS CELL
                var statusCell = worksheet.Cell(row, 6);
                statusCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                statusCell.Style.Font.Bold = true;

                string statusCode = InvoicesService.GetStatusCode(inv);
                switch (statusCode)
                {
                    case "0": // Saldata (Paid) - GREEN
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHex("#10B981");
                        statusCell.Style.Font.FontColor = XLColor.White;
                        break;

                    case "1": // Non Saldata (Unpaid) - YELLOW
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHex("#F59E0B");
                        statusCell.Style.Font.FontColor = XLColor.Black;
                        break;

                    case "2": // Scaduta (Overdue) - RED
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHex("#EF4444");
                        statusCell.Style.Font.FontColor = XLColor.White;
                        break;
                }

                row++;
            }

            // AUTO-FIT COLUMNS
            worksheet.Columns().AdjustToContents();

            // FREEZE HEADER ROW
            worksheet.SheetView.FreezeRows(1);

            // SAVE TO MEMORY STREAM
            using (var stream = new System.IO.MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }
    */


    // ═══════════════════════════════════════════════════════════════════
    // PDF EXPORT - 🚧 PHASE 3 (PREPARED, COMMENTED OUT)
    //
    // TO ACTIVATE:
    // 1. Install NuGet package: Install-Package PdfSharp -Version 6.2.0
    // 2. Add to DBEngine.csproj references section
    // 3. Add to packages.config
    // 4. Uncomment code below
    // 5. Uncomment ExportInvoicesPDF.ashx implementation
    // ═══════════════════════════════════════════════════════════════════

    /*
    using PdfSharp.Pdf;
    using PdfSharp.Drawing;

    /// <summary>
    /// Generate PDF file from invoice data (Phase 3)
    /// Requires: Install-Package PdfSharp
    /// Features: Professional layout, company branding, print-ready
    /// </summary>
    /// <param name="invoices">List of invoices to export</param>
    /// <returns>PDF file bytes (.pdf)</returns>
    public static byte[] GeneratePDF(List<InvoiceDTO> invoices)
    {
        if (invoices == null || invoices.Count == 0)
        {
            throw new ServiceException("Nessuna fattura da esportare");
        }

        var document = new PdfDocument();
        var page = document.AddPage();
        page.Orientation = PdfSharp.PageOrientation.Landscape; // Landscape for table
        var gfx = XGraphics.FromPdfPage(page);

        // FONTS
        var titleFont = new XFont("Arial", 18, XFontStyle.Bold);
        var headerFont = new XFont("Arial", 10, XFontStyle.Bold);
        var bodyFont = new XFont("Arial", 9, XFontStyle.Regular);
        var smallFont = new XFont("Arial", 8, XFontStyle.Regular);

        // TITLE
        gfx.DrawString("Elenco Fatture - Loginet", titleFont, XBrushes.Black,
                       new XRect(0, 40, page.Width, 50), XStringFormats.TopCenter);

        // GENERATION DATE
        string dateStr = string.Format("Generato: {0}", DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
        gfx.DrawString(dateStr, bodyFont, XBrushes.Gray,
                       new XRect(0, 70, page.Width, 20), XStringFormats.TopCenter);

        // TABLE (simplified - for production use, consider MigraDoc for complex tables)
        int yPos = 100;
        int rowHeight = 20;
        int[] colWidths = { 80, 80, 120, 70, 70, 70, 60, 60, 60 }; // Column widths

        // HEADER ROW
        int xPos = 50;
        string[] headers = { "N° Fattura", "N° Ordine", "Cliente", "Immissione", "Scadenza",
                            "Stato", "Imponibile", "IVA", "Totale" };

        for (int i = 0; i < headers.Length; i++)
        {
            gfx.DrawRectangle(new XSolidBrush(XColor.FromArgb(0, 44, 61)), xPos, yPos, colWidths[i], rowHeight);
            gfx.DrawString(headers[i], headerFont, XBrushes.White,
                          new XRect(xPos, yPos + 5, colWidths[i], rowHeight), XStringFormats.TopCenter);
            xPos += colWidths[i];
        }

        yPos += rowHeight;

        // DATA ROWS
        foreach (var dto in invoices)
        {
            var inv = dto.Invoice;
            xPos = 50;

            string[] rowData = {
                inv.InvoiceNumber,
                inv.InvoiceOrderNumber,
                inv.Customer.CustomerName,
                inv.InvoiceCreationDate.ToString("dd/MM/yyyy"),
                inv.InvoiceDueDate.ToString("dd/MM/yyyy"),
                GetStatusDisplayString(inv),
                FormatDecimalForCSV(inv.InvoiceTaxable) + " €",
                FormatDecimalForCSV(inv.InvoiceTax) + " €",
                FormatDecimalForCSV(inv.InvoiceDue) + " €"
            };

            for (int i = 0; i < rowData.Length; i++)
            {
                gfx.DrawString(rowData[i], bodyFont, XBrushes.Black,
                              new XRect(xPos + 2, yPos + 5, colWidths[i] - 4, rowHeight),
                              XStringFormats.TopLeft);
                xPos += colWidths[i];
            }

            yPos += rowHeight;

            // PAGE BREAK (if needed)
            if (yPos > page.Height - 100)
            {
                page = document.AddPage();
                page.Orientation = PdfSharp.PageOrientation.Landscape;
                gfx = XGraphics.FromPdfPage(page);
                yPos = 50; // Reset Y position for new page
            }
        }

        // FOOTER
        string footer = "Loginet Invoice Management System - Pagina 1";
        gfx.DrawString(footer, smallFont, XBrushes.Gray,
                      new XRect(0, page.Height - 30, page.Width, 20), XStringFormats.TopCenter);

        // SAVE TO MEMORY STREAM
        using (var stream = new System.IO.MemoryStream())
        {
            document.Save(stream, false);
            return stream.ToArray();
        }
    }
    */


    // ═══════════════════════════════════════════════════════════════════
    // FUTURE: AUDIT LOGGING
    //
    // When implementing audit logging (Phase 4), add logging calls in ASHX handlers:
    //
    // EXAMPLE (in ExportInvoicesCSV.ashx, after successful export):
    //
    // DiagnosticLogger.LogInfo(string.Format("EXPORT: User={0}, Count={1}, Format=CSV, Timestamp={2}, InvoiceIds=[{3}]",
    //                          tokenInfo.Username, invoices.Count, DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
    //                          string.Join(",", invoiceIds)));
    //
    // WHAT TO LOG:
    // - Username (from tokenInfo)
    // - Export format (CSV, Excel, PDF)
    // - Invoice count
    // - Invoice IDs (if count < 50, otherwise omit for performance)
    // - Timestamp (UTC)
    // - IP address (optional): HttpContext.Current.Request.UserHostAddress
    //
    // WHERE TO LOG:
    // - DiagnosticLogger already exists in project
    // - Logs written to diagnostic table or file
    // - Can be queried via diagnostic viewer
    //
    // WHEN TO LOG:
    // - After successful export (onSuccess)
    // - Before returning response
    // - Do NOT log on validation errors (too noisy)
    //
    // SECURITY NOTES:
    // - Do NOT log invoice amounts (sensitive financial data)
    // - Do NOT log customer names (GDPR compliance)
    // - Log only metadata (IDs, counts, timestamps)
    // ═══════════════════════════════════════════════════════════════════
}
