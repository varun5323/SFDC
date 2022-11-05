public class LimitsDeleteScheduler implements Database.Batchable<SObject>, Schedulable {

    public Database.QueryLocator start(Database.BatchableContext bc){
        DateTime myTime = System.now().addMinutes(2);
        String query = 'SELECT Id from Limit_SnapShot__c WHERE Mark_for_Delete__c = True';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext bc, List<Limits__c> scope){
        delete scope;
    }
    
    public void finish(Database.BatchableContext bc){
        
    }
    
    public void execute(System.SchedulableContext sc){
        Database.executeBatch(new LimitsDeleteScheduler());
    }
}