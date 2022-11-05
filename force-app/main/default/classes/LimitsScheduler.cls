public class LimitsScheduler implements Database.Batchable<SObject>, Schedulable {

    public Database.QueryLocator start(Database.BatchableContext bc){
        DateTime myTime = System.now().addMinutes(2);
        String query = 'SELECT Id,Name,ExternalId__c FROM LIMITS__c WHERE Next_Snapshot_Date__c < :myTime OR Next_Snapshot_Date__c = NULL';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext bc, List<Limits__c> scope){
        LimitsUtil.createSnapShot(scope);
    }
    
    public void finish(Database.BatchableContext bc){
        
    }
    
    public void execute(System.SchedulableContext sc){
        Database.executeBatch(new LimitsScheduler());
    }
}