Console.WriteLine("RADIX to Nexus file utility - v0.0 (2026-09-10)");
Console.WriteLine("-----------------------------------------------");

try {

    
    NSEngine ns = new NSEngine();
    // ns.UploadFolder(@"C:\e_drive\.temp\twc-radix-data\profiles\3", TWCRecordType.PROFILE);
    // return;

    // ns.UploadCompanyFiles();
    // ns.UploadProfileFiles();
    ns.UploadSiteFiles();



} catch (System.Exception ex) {
    Console.WriteLine(ex.Message);

} finally {
    Console.WriteLine("-----------------------------------------------");
    Console.WriteLine("Press enter to exit");
    Console.ReadLine();
}


