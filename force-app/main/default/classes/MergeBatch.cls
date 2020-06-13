global class MergeBatch implements Database.Batchable<sObject>,Database.stateful {
	global List<String> SuccessExtIds = new List<String>();
    
    
    global Database.QueryLocator start(Database.BatchableContext BC){
        
        return Database.getQueryLocator('Select id,Master_Record__c,Merging_Record__c,Object_Name__c,Attempt_Count__c from Merge_Records__c WHERE Merge_Successful__c =false AND Attempt_Count__c < 5');
    }
    
    global void execute(Database.BatchableContext bc,List<Merge_Records__c> scope){
        SObject master = Schema.getGlobalDescribe().get(scope[0].Object_Name__c).newSObject();
        List<Id> duplicates = new List<Id>();
        for(Merge_Records__c m :scope){
            master.Id=m.Master_Record__c;
            duplicates.add(m.Merging_Record__c);
            m.Merge_Attempted__c = true;   
            m.Attempt_Count__c += 1;
        }
        update scope;
        Database.MergeResult[] results = Database.merge(master, duplicates, false);
        for(Database.MergeResult res : results){
            if(res.isSuccess()){
                Id masterId = res.getId();
                List<Id> dupIds = res.getMergedRecordIds();
                for(Id i : dupIds){
                    SuccessExtIds.add(masterId+'-'+i);
                }
            }
        }
    }
    
    global void finish(Database.BatchableContext bc){
        List<Merge_Records__c> mrs = [SELECT Id,Merge_Successful__c from Merge_Records__c where Ext_Ref_Id__c IN :SuccessExtIds];
        for(Merge_Records__c m :mrs){
            m.Merge_Successful__c = true;
        }
        update mrs;
        
    }

}