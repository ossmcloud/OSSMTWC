using System.Dynamic;
using System.Text.Json;
using ZstdSharp.Unsafe;

public class Utils {
    public static void SortNumeric(string[] array) {
        Array.Sort(array, (fileA, fileB) => {
            string a = Path.GetFileName(fileA);
            string b = Path.GetFileName(fileB);
            long valA = 0; long valB = 0;
            if (long.TryParse(a, out valA) && long.TryParse(b, out valB)) {
                return valA.CompareTo(valB);
            } else {
                return a.CompareTo(b);
            }
        });
    }
}

public class JObject {
    string _json;
    dynamic _object;
    IDictionary<string, object> _objectProperties;

    public dynamic Obj { get { return _object; } }

    public JObject(string json) {
        _json = json;

        var options = new JsonSerializerOptions();
        _object = JsonSerializer.Deserialize<ExpandoObject>(json, options);
        _objectProperties = (IDictionary<string, object>)_object;
    }

    public bool HasProperty(string name) {
        return _objectProperties.ContainsKey(name);
    }



    public string GetString(string name) {
        if (!this.HasProperty(name)) { return null; }
        return _objectProperties[name].ToString();
    }

}

public class TWCRecordType {
    public const string COMPANY = "customrecord_twc_company";
    public const string PROFILE = "customrecord_twc_prof";
}


public class NSEngine {
    const string URL = "https://9061443-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1597&deploy=1&compid=9061443_SB1&ns-at=AAEJ7tMQdQwtQsRFNIW8CUFQJmGAxNYtlxu70wSA0FxBrs7PYcY";


    private RadixDB _radix = new RadixDB();
    private HttpClient _nsClient;

    public NSEngine() {
        _nsClient = new HttpClient();
    }


    public void UploadFolder(string folderPath, string recordType, int startFrom = 0) {

        int errorCount = 0;
        string[] files = System.IO.Directory.GetFiles(folderPath);

        try {
            string radixId = Path.GetFileName(folderPath);


            Console.WriteLine();
            Console.WriteLine($"FOLDER-START: [FILES: {files.Length}] [{radixId}] {folderPath}");

            if (int.Parse(radixId) < startFrom) {
                Console.WriteLine($"FOLDER-SKIPPED: {folderPath}");
                Console.WriteLine();
                return;
            }


            Utils.SortNumeric(files);

            for (var fx = 0; fx < files.Length; fx++) {
                string file = files[fx];
                Console.Write($"{(fx + 1).ToString().PadLeft(3)}. File: {Path.GetFileName(file).PadRight(20)} ");
                if (!this.UploadFile(file, radixId, recordType)) {
                    errorCount++;
                }
            }

            Console.WriteLine($"FOLDER-END: [{files.Length} - ERRORS: {errorCount}]  {folderPath}");
            Console.WriteLine();
        } catch (System.Exception ex) {
            Console.WriteLine($"FOLDER-ERROR: [{files.Length} - ERRORS: {errorCount}]  {ex.Message}");
            Console.WriteLine();
            
        }
    }


    public bool UploadFile(string filePath, string radixId, string recordType) {
        bool success = false;
        try {


            string fileType = string.Empty;
            string fileName = Path.GetFileNameWithoutExtension(filePath);
            string ext = Path.GetExtension(filePath);
            string submitted = string.Empty;
            string descr = string.Empty;
            string radixFileId = string.Empty;
            if (string.IsNullOrEmpty(ext)) {
                RadixFileInfo fileInfo = _radix.GetFileInfo(fileName);
                if (fileInfo.Deleted) { throw new Exception("File is flagged as deleted in Radix"); }
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
                fileName = fileName,
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

            success = true;
        } catch (System.Exception ex) {
            Console.Write($"ERROR: {ex.Message}");
            if (ex.Message.Contains("no company assigned to it")) {
                throw new Exception("ERROR causes to skip folder");
            }

        } finally {
            Console.WriteLine();
        }

        return success;
    }




}


