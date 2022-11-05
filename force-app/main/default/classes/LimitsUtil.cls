public class LimitsUtil {
    private static final String INVALID_LIMIT = 'The limit key is invalid. Please check the key and update.';
    public static String createSnapShot(List<Limits__c> limList){
        try{
            Map<String,System.OrgLimit> limits = OrgLimits.getMap();
            List<Limits__c> limitsToUpdate = new List<Limits__c>();
            List<Limit_Snapshot__c> snapshotList = new List<Limit_Snapshot__c>();
            if(limList == null){
                limList = [ 
                    SELECT Id,Name,ExternalId__c                         
                    FROM LIMITS__c 
                    WHERE 
                    Next_Snapshot_Date__c < :System.now().addMinutes(2)
                    OR
                    Next_Snapshot_Date__c = NULL
                ];
            }
            
            for(Limits__c lim : limList){
                if(!limits.containsKey(lim.ExternalId__c)){
                    lim.Errors__c = INVALID_LIMIT;
                    limitsToUpdate.add(lim);
                }else{
                    System.OrgLimit orgLimit = limits.get(lim.ExternalId__c);
                    snapshotList.add(
                        new Limit_Snapshot__c(
                            Limits__c = lim.Id,
                            Max_Value__c = orgLimit.getLimit(),
                            Value__c = orgLimit.getValue()
                        )
                    );
                    lim.Latest_Snap_Shot_Max_Value__c  = orgLimit.getLimit();
                    lim.Latest_Snap_Shot_Value__c = orgLimit.getValue();
                    limitsToUpdate.add(lim);
                }
                
            }
            
            if(snapshotList.size() > 0){
                insert snapshotList;
            }
            
            if(limitsToUpdate.size() > 0){
                Database.update(limitsToUpdate,false);
            }
            return 'Success';
        }catch(Exception e){
            return e.getMessage();
        }
        
        
    }
    
    @AuraEnabled
    public static String createSnapShotOnDemand(){
        DateTime myTime = System.now().addMinutes(2);
        String query = 'SELECT Id,Name,ExternalId__c FROM LIMITS__c';
        List<Limits__c> limList = Database.query(query);
        return createSnapShot(limList);
        
    }
    
    @AuraEnabled
    public static List<Limits__c> getSnapShots(){
        return [Select 
                ID,
                NAME,
                ExternalId__c,
                Alert_Threshold__c,
                Errors__c,
                Latest_Snapshot__c,
                Mute_Alerts__c,
                Next_Snapshot_Date__c,
                Retention_Days__c ,
                Scheduled_Period__c,
                Latest_Snap_Shot_Consumption__c,
                (SELECT Id,
                 Consumed_Percentage__c,
                 Limit_Max_Threshold__c,
                 Limit_Name__c,
                 Limits__c,
                 Max_Value__c ,
                 Value__c 
                 FROM Limit_SnapShot__r
                 ORDER BY CREATEDDATE DESC 
                 LIMIT 1
                )
                FROM LIMITS__c
               ];
    }
    
    @AuraEnabled
    public static FieldSetForm getForm(Id recordId, String objectName, String fieldSetName) {
        FieldSetForm form = new FieldSetForm();        
        form.Fields = getFields(recordId, objectName, fieldSetName);
        
        return form;
    }
    
    private static List<FormField> getFields(Id recordId, String objectName, String fieldSetName) {
        Schema.SObjectType objectType = null;
        
        if (recordId != null) {
            objectType = recordId.getSobjectType();
        }
        else if (String.isNotBlank(objectName)) {
            objectType = Schema.getGlobalDescribe().get(objectName);
        }
        
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
        Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
        Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
        List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
        
        List<FormField> fields = new List<FormField>();
        for (Schema.FieldSetMember fsm : fieldSetMembers) {
            FormField f = new FormField(fsm);
            fields.add(f);
        }
        
        return fields;
    }
    
    public class FieldSetForm {
        @AuraEnabled
        public List<FormField> Fields { get; set; }
        
        public FieldSetForm() {
            Fields = new List<FormField>();
        }
    }
    
    public class FormField{
        @AuraEnabled
        public String ApiName;
        @AuraEnabled
        public String label;
        //public Schema.FieldSetMember fsm;
        public Formfield(Schema.FieldSetMember fsm){
            //this.fsm = fsm;
            this.ApiName = fsm.getFieldPath();
            this.label = fsm.getLabel();
        }
    }
}