using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// In-memory diagnostic logger for debugging ASHX handlers.
/// Stores logs in static list (clears on app restart).
/// Access logs via diagnostic-viewer.html page.
/// </summary>
public static class DiagnosticLogger
{
    // Thread-safe list for storing log entries
    private static readonly object _lock = new object();
    private static readonly List<LogEntry> _logs = new List<LogEntry>();
    private static readonly int MaxLogEntries = 500; // Keep last 500 entries

    /// <summary>
    /// Log entry with timestamp and message
    /// </summary>
    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Level { get; set; }
        public string Message { get; set; }
        public string StackTrace { get; set; }

        public LogEntry(string level, string message, string stackTrace = null)
        {
            Timestamp = DateTime.Now;
            Level = level;
            Message = message;
            StackTrace = stackTrace;
        }
    }

    /// <summary>
    /// Log INFO level message
    /// </summary>
    public static void Info(string message)
    {
        Log("INFO", message);
    }

    /// <summary>
    /// Log DEBUG level message
    /// </summary>
    public static void Debug(string message)
    {
        Log("DEBUG", message);
    }

    /// <summary>
    /// Log WARNING level message
    /// </summary>
    public static void Warning(string message)
    {
        Log("WARNING", message);
    }

    /// <summary>
    /// Log ERROR level message with optional exception
    /// </summary>
    public static void Error(string message, Exception ex = null)
    {
        string stackTrace = null;
        if (ex != null)
        {
            stackTrace = string.Format(
                "Exception: {0}\nMessage: {1}\nStack Trace: {2}",
                ex.GetType().FullName,
                ex.Message,
                ex.StackTrace
            );

            if (ex.InnerException != null)
            {
                stackTrace += string.Format(
                    "\n\nInner Exception: {0}\nMessage: {1}\nStack Trace: {2}",
                    ex.InnerException.GetType().FullName,
                    ex.InnerException.Message,
                    ex.InnerException.StackTrace
                );
            }
        }

        Log("ERROR", message, stackTrace);
    }

    /// <summary>
    /// Core logging method
    /// </summary>
    private static void Log(string level, string message, string stackTrace = null)
    {
        lock (_lock)
        {
            _logs.Add(new LogEntry(level, message, stackTrace));

            // Keep only last MaxLogEntries to prevent memory issues
            if (_logs.Count > MaxLogEntries)
            {
                _logs.RemoveAt(0);
            }

            // Also write to Trace for DebugView/VS Output
            System.Diagnostics.Trace.WriteLine(
                string.Format("[{0}] [{1}] {2}",
                    DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                    level,
                    message
                )
            );

            if (!string.IsNullOrEmpty(stackTrace))
            {
                System.Diagnostics.Trace.WriteLine(stackTrace);
            }
        }
    }

    /// <summary>
    /// Get all log entries (thread-safe)
    /// </summary>
    public static List<LogEntry> GetLogs()
    {
        lock (_lock)
        {
            return new List<LogEntry>(_logs);
        }
    }

    /// <summary>
    /// Get logs since a specific timestamp
    /// </summary>
    public static List<LogEntry> GetLogsSince(DateTime since)
    {
        lock (_lock)
        {
            return _logs.Where(log => log.Timestamp > since).ToList();
        }
    }

    /// <summary>
    /// Get last N log entries
    /// </summary>
    public static List<LogEntry> GetLastLogs(int count)
    {
        lock (_lock)
        {
            int startIndex = Math.Max(0, _logs.Count - count);
            return _logs.Skip(startIndex).ToList();
        }
    }

    /// <summary>
    /// Clear all logs
    /// </summary>
    public static void Clear()
    {
        lock (_lock)
        {
            _logs.Clear();
        }
        System.Diagnostics.Trace.WriteLine("[DIAGNOSTIC] Logs cleared");
    }

    /// <summary>
    /// Get log statistics
    /// </summary>
    public static object GetStats()
    {
        lock (_lock)
        {
            // C# 5 compatible: Extract values before creating anonymous object
            var oldest = _logs.FirstOrDefault();
            var newest = _logs.LastOrDefault();

            return new
            {
                TotalLogs = _logs.Count,
                ErrorCount = _logs.Count(l => l.Level == "ERROR"),
                WarningCount = _logs.Count(l => l.Level == "WARNING"),
                InfoCount = _logs.Count(l => l.Level == "INFO"),
                DebugCount = _logs.Count(l => l.Level == "DEBUG"),
                OldestLog = oldest != null ? (DateTime?)oldest.Timestamp : null,
                NewestLog = newest != null ? (DateTime?)newest.Timestamp : null
            };
        }
    }
}
