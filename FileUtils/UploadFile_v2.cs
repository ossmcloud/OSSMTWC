using System.Dynamic;
using System.Text.Json;
using ZstdSharp.Unsafe;


public class NSEngineCsv {
    const string URL = "https://9061443-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1597&deploy=1&compid=9061443_SB1&ns-at=AAEJ7tMQdQwtQsRFNIW8CUFQJmGAxNYtlxu70wSA0FxBrs7PYcY";

    private RadixDB _radix = new RadixDB();
    private HttpClient _nsClient;

    public NSEngineCsv() {
        _nsClient = new HttpClient();
    }


    public void UpdateSiteFiles(string csvFileName, string targetFolder) {
        Console.WriteLine($"TRANSFER SITE FILE: {targetFolder}: {csvFileName}");

        string[] fileLines = System.IO.File.ReadAllLines(csvFileName);
        for (int lx = 1; lx < fileLines.Length; lx++) {
            try {
                string[] fileValues = fileLines[lx].Split(',');
                string filePath = fileValues[2].Trim().Replace("/var/www/html/public/uploads", @"C:\e_drive\.temp\twc-radix-data");
                string siteId = fileValues[0].Trim();

                filePath = Path.Join(filePath, fileValues[3]);

                Console.Write($"Line: {lx}: {siteId} - {filePath.PadRight(100)} ");
                (bool s, string r) = this.UploadFile(filePath, siteId, TWCRecordType.SITE, fileValues[5], targetFolder);
                LogFile.Log(Path.GetFileName(csvFileName), lx, filePath, r);

            } catch (System.Exception ex) {
                Console.Write($"ERROR: {ex.Message}");
            }
        }

        Console.WriteLine();
    }


    public void UpdateEntityFiles(string csvFileName, string recordType) {
        Console.WriteLine($"TRANSFER ENTITY FILE: {recordType}: {csvFileName}");

        string[] fileLines = System.IO.File.ReadAllLines(csvFileName);

        for (int lx = 1; lx < fileLines.Length; lx++) {
            try {
                string[] fileValues = fileLines[lx].Split(',');
                if (fileValues[5] != "TRANSFER") { continue; }

                string filePath = fileValues[2].Trim().Replace("/var/www/html/public/uploads", @"C:\e_drive\.temp\twc-radix-data");
                string profileId = fileValues[0].Trim();

                filePath = Path.Join(filePath, fileValues[3]);

                Console.Write($"Line: {lx}: {profileId} - {filePath.PadRight(100)} ");
                (bool s, string r) = this.UploadFile(filePath, profileId, recordType, fileValues[7].Trim());
                LogFile.Log(Path.GetFileName(csvFileName), lx, filePath, r);

            } catch (System.Exception ex) {
                Console.Write($"ERROR: {ex.Message}");
            } finally {
                // Console.WriteLine();
            }
        }
    }



    public (bool, string) UploadFile(string filePath, string radixId, string recordType, string targetFileName, string targetFolder = "") {
        bool success = false;
        string resp = string.Empty;
        try {
            string fileType = string.Empty;
            string fileName = Path.GetFileNameWithoutExtension(filePath);
            string ext = Path.GetExtension(filePath);
            string submitted = string.Empty;
            string descr = string.Empty;
            string radixFileId = string.Empty;


            RadixFileInfo fileInfo = null;
            if (string.IsNullOrEmpty(ext)) {
                fileInfo = _radix.GetFileInfo(fileName);
                //if (fileInfo.Deleted) { throw new Exception("File is flagged as deleted in Radix"); }
                fileName = fileInfo.Name;
                fileType = fileInfo.Type.ToString();
                submitted = fileInfo.Submitted.ToString("yyyy-MM-dd HH:mm:ss");
                descr = fileInfo.Description;
                radixFileId = fileInfo.ID.ToString();
            } else {
                fileName = Path.GetFileName(filePath);
            }


            byte[] fileBytes = File.ReadAllBytes(filePath);
            string base64String = Convert.ToBase64String(fileBytes);

            dynamic payload = new {
                recordType = recordType,
                radixId = radixId,
                fileType = fileType,
                fileName = string.IsNullOrEmpty(targetFileName) ? fileName : targetFileName,
                folder = targetFolder,
                submitted = submitted,
                description = descr,
                radixFileId = radixFileId,
                content = base64String,
            };

            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{URL}&action=upload-file");
            request.Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload));

            JObject jResponse = null;
            HttpResponseMessage response = _nsClient.Send(request);
            using (StreamReader reader = new StreamReader(response.Content.ReadAsStream())) { jResponse = new JObject(reader.ReadToEnd()); }

            if (jResponse.HasProperty("error")) { throw new Exception(jResponse.GetString("error")); }
            Console.Write(jResponse.GetString("message"));

            resp = jResponse.GetString("message");
            if (fileInfo != null && fileInfo.Deleted) { resp += " WARN: File is flagged as deleted in Radix"; }

            success = true;
        } catch (System.Exception ex) {
            Console.Write($"ERROR: {ex.Message}");
            resp = $"ERROR: {ex.Message}";

        } finally {
            Console.WriteLine();
        }

        return (success, resp);
    }




}