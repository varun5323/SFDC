public class MergeRelatedController {
    
    @AuraEnabled
    public static MergeWrapper getDuplicates(Id sobj,String objName){
        sObject s = Schema.getGlobalDescribe().get(objName).newSObject() ;
        s.Id = sobj;
        List<Sobject> sObjectList = new List<Sobject>{s};
        
        MergeWrapper mw = new MergeWrapper();

        Datacloud.FindDuplicatesResult[] results = Datacloud.FindDuplicates.findDuplicates(sObjectList);
        for (Datacloud.FindDuplicatesResult findDupeResult : results) {  
            for (Datacloud.DuplicateResult dupeResult : findDupeResult.getDuplicateResults()) {               
                for (Datacloud.MatchResult matchResult : dupeResult.getMatchResults()) {
                    for (Datacloud.MatchRecord matchRecord : matchResult.getMatchRecords()) {
                        mw.dupRecords.add((SObject)matchRecord.getRecord());
                    }
                }
            }
        }
        return mw;
        
    }
    
    @AuraEnabled
    public static InitWrapper getColumns(String objName,Id sobj){
        InitWrapper iw = new InitWrapper();
        iw.cols = [SELECT Id, Name, Object_Name__c, Field_API_Name__c, Field_Type__c,Label__c FROM MergeColumns__c WHERE Object_Name__c =:objName];
        iw.mw = getDuplicates(sobj,objName);
        if(iw.mw != null && iw.mw.dupRecords !=null)
        	iw.sObjMap = new Map<Id,Sobject>(iw.mw.dupRecords);
        iw.mrList = [Select id,Master_Record__c,Merging_Record__c,Object_Name__c,Merge_Attempted__c
                from Merge_Records__c WHERE Master_Record__c =:sobj AND Merge_Successful__c = false];
        for(Integer i = 0 ; i < iw.mrList.size(); i++){
            if(!iw.SObjMap.containsKey(iw.mrList[i].Merging_Record__c)){
                iw.mrList.remove(i);
            }
        }
        
        return iw;
    }
    
    @AuraEnabled
    public static String insertMerges(String masterId, List<String> childIds,String objName){
        List<Merge_Records__c> mergeRecs = new List<Merge_Records__c>();
        for(String s : childIds){
            Merge_Records__c m = new Merge_Records__c();
            m.Master_Record__c = masterId;
            m.Merging_Record__c = s;
            m.Object_Name__c = objName;
            mergeRecs.add(m);
        }
        try{
            Database.insert(mergeRecs,false) ;
            //insert mergeRecs;
            return 'Success';
                 
        }
        catch(exception ex){
            if(ex.getMessage().containsIgnoreCase('Ext_Ref_Id__c duplicates'))
                return 'The Records are already added in Queue';
            return ex.getMessage();
        }
        //Database.insert(mergeRecs,false);
        //return mergeRecs;
    }
    
    @AuraEnabled 
    public static String deleteMerges(String mergeId){
        try{
            delete[select id from Merge_Records__c WHERE Id=:mergeId];
            return 'Success';
        }
        catch(Exception e){
            return e.getMessage();
        }
    }
    
    @AuraEnabled
    public static List<Merge_Records__c> getQueue(String masterId){
        return [Select id,Master_Record__c,Merging_Record__c,Object_Name__c,Merge_Attempted__c
                from Merge_Records__c WHERE Master_Record__c =: masterId AND Merge_Successful__c = false];
    }
    
    
    public class MergeWrapper{
        @AuraEnabled public string objName;
        @AuraEnabled public List<SObject> dupRecords; 
        
        public MergeWrapper(){
            dupRecords = new List<Sobject>();
        }
    }
    
    public class InitWrapper{
        @AuraEnabled public List<MergeColumns__c> cols;
        @AuraEnabled public List<Account> Accounts;
        @AuraEnabled public MergeWrapper mw;
        @AuraEnabled public List<Merge_Records__c> mrList;
        @AuraEnabled public Map<Id,Sobject> sObjMap;
        
        public InitWrapper(){
            cols = new List<MergeColumns__c>();
            Accounts = new List<Account>();
            mrList = new List<Merge_Records__c>();
            mw = new MergeWrapper();
            sObjMap = new Map<Id,Account>();
        }
    }
}