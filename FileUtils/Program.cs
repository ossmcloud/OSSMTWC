Console.WriteLine("RADIX to Nexus file utility - v0.0 (2026-09-10)");
Console.WriteLine("-----------------------------------------------");

try {

    NSEngine ns = new NSEngine();
    // ns.UploadFolder(@"C:\e_drive\.temp\twc-radix-data\profiles\3", TWCRecordType.PROFILE);
    // return;

    string[] folders = Directory.GetDirectories(@"C:\e_drive\.temp\twc-radix-data\profiles");
    Utils.SortNumeric(folders);
    foreach (string folder in folders) {
        ns.UploadFolder(folder, TWCRecordType.PROFILE, 50);
    }



    // string[] folders = Directory.GetDirectories(@"C:\e_drive\.temp\twc-radix-data\companies");
    // Utils.SortNumeric(folders);
    // foreach (string folder in folders) {
    //     ns.UploadFolder(folder, TWCRecordType.COMPANY, 18);
    // }

} catch (System.Exception ex) {
    Console.WriteLine(ex.Message);

} finally {
    Console.WriteLine("-----------------------------------------------");
    Console.WriteLine("Press enter to exit");
    Console.ReadLine();
}


