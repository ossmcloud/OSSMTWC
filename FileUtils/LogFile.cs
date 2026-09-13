

public class LogFile {


    public static string _logFilePath = @"C:\e_drive\OSSM Developments\OSSMTWC\.docs\fileTransfer\";
    public static string _logFile = string.Empty;

    public static void InitLog() {
        _logFile = System.IO.Path.Join(_logFilePath, DateTime.Now.ToString("yyyy-MM-dd_HH.mm")) + ".csv";
        System.IO.File.AppendAllText(_logFile, $"Source File,Line,File Name,Response{Environment.NewLine}");
    }

    public static void Log(string sourceFile, int line, string sourcePath, string response) {
        System.IO.File.AppendAllText(_logFile, $"{sourceFile},{line},{sourcePath},{response}{Environment.NewLine}");
    }



}