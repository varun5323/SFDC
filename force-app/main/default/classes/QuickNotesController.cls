public with sharing class QuickNotesController {
    @AuraEnabled(cacheable=true)
    public static QuickNotes__c getNotes(String recId){
        system.debug('RecordId--' + recId);
        List<QuickNotes__c> q = [Select Id,Record_Id__c,Notes__c from QuickNotes__c where Record_Id__c =:recId LIMIT 1];
        system.debug('Record--' + q);
        if(q.size() > 0){
            return q[0];
        }else{
            return null;
        }
        //return null;
        
    }

    @AuraEnabled
    public static string upsertNotes(QuickNotes__c q){
        /*QuickNotes__c q = new QuickNotes__c();
        q.Record_Id__c = recId;
        q.Notes__c = Notes;*/
        try{
            upsert q Record_Id__c;  
            system.debug('Success Upsert');
            return 'Success';
        }catch(Exception ex){
            system.debug('Success Upsert--' + ex.getMessage());
            //throw new AuraHandledException(ex.getMessage());
            return ex.getMessage();
        }   
    }

    @AuraEnabled
    public static string deleteNotes(String recId){
        List<QuickNotes__c> q = [Select Id,Record_Id__c,Notes__c from QuickNotes__c where Record_Id__c =:recId LIMIT 1];
        if(q.size() > 0){
            delete q;
            return 'Success';
        }else{
            return 'No Records';
        }
        
    }
}