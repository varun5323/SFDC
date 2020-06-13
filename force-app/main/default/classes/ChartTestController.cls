public class ChartTestController {
    @AuraEnabled
    public static String getreport(String ReportName){
        //Using report id for example purpose
        Report reportRec = [SELECT
                            Id
                            FROM Report
                            WHERE Name = :ReportName];
        
        Reports.ReportResults reportResult =
            Reports.ReportManager.runReport(reportRec.Id, true);
        
        return JSON.serialize(reportResult);
    }

}