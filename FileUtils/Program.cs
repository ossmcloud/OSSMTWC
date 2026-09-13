Console.WriteLine("RADIX to Nexus file utility - v0.0 (2026-09-10)");
Console.WriteLine("-----------------------------------------------");

try {

    LogFile.InitLog();

    NSEngineCsv ns = new NSEngineCsv();
    ns.UpdateSiteFiles(@"C:\e_drive\OSSM Developments\OSSMTWC\.docs\fileTransfer\Site_access_docs.csv", "Access");
    ns.UpdateSiteFiles(@"C:\e_drive\OSSM Developments\OSSMTWC\.docs\fileTransfer\Site_license_map.csv", "Licence Maps");
    ns.UpdateEntityFiles(@"C:\e_drive\OSSM Developments\OSSMTWC\.docs\fileTransfer\Company_files.csv", TWCRecordType.COMPANY);
    ns.UpdateEntityFiles(@"C:\e_drive\OSSM Developments\OSSMTWC\.docs\fileTransfer\Profile_files.csv", TWCRecordType.PROFILE);



    // NSEngine ns = new NSEngine();
    // ns.UploadFolder(@"C:\e_drive\.temp\twc-radix-data\profiles\3", TWCRecordType.PROFILE);
    // return;

    // ns.UploadCompanyFiles();
    // ns.UploadProfileFiles();
    // ns.UploadSiteFiles("Bralee - TSO1007");



} catch (System.Exception ex) {
    Console.WriteLine(ex.Message);

} finally {
    Console.WriteLine("-----------------------------------------------");
    Console.WriteLine("Press enter to exit");
    Console.ReadLine();
}


