public with sharing class SDGController {
    @AuraEnabled
    public static List<Sobject> getRelatedRecords(String fields,String ObjectName,String Condition,String RelationField,String recId){
        String query = 'SELECT ';
        query += fields + ' FROM ';
        query += ObjectName + ' WHERE ';
        query += RelationField + '=\'' + recId + '\'';
        if(Condition != null && Condition != ''){
            query += ' AND ' + Condition;
        }
        system.debug('Query---' + query);
        List<Sobject> childRecs = Database.query(query);
        return childRecs;
    }
	
    @AuraEnabled
    public static Map<String,String> getFieldTypes(String fields, String ObjectName){
        List<String> fieldsList = fields.split(',');
        Map<Schema.DisplayType,String> TypeMap = buildTypeMap();
        Map<String,String> fieldToTypeMap = new Map<String,String>();
		Map<String, Schema.SObjectField> M = Schema.getGlobalDescribe().get(ObjectName).getDescribe().fields.getMap();
        for(String s: fieldsList){
            if(s == '')
                continue;
            try{
                if(s.contains('.')){
                    String obj = s.split('\\.')[0];
                    String sfield = s.split('\\.')[1];
                    Map<String, Schema.SObjectField> N = Schema.getGlobalDescribe().get(obj).getDescribe().fields.getMap();
                    Schema.DisplayType FieldType = N.get(sfield).getDescribe().getType();
                    fieldToTypeMap.put(s,TypeMap.get(FieldType));
                }else{
                    Schema.DisplayType FieldType = M.get(s).getDescribe().getType();
                    if(TypeMap.containsKey(FieldType)){
                        fieldToTypeMap.put(s,TypeMap.get(FieldType));
                    }else{
                        fieldToTypeMap.put(s,'anytype');
                    }
                    system.debug('FieldType of '+s+'--' + FieldType);
                }
                
            }catch(exception ex){
                system.debug('--Exception--' +ex.getMessage());
            }
        }
        system.debug('---Map---'+ fieldToTypeMap);
        return fieldToTypeMap;
    }
    
    @AuraEnabled
    public static Map<Schema.DisplayType,String> buildTypeMap(){
        Map<Schema.DisplayType,String> TypeMap = new Map<Schema.DisplayType,String>();
        TypeMap.put(Schema.DisplayType.String,'text');
        TypeMap.put(Schema.DisplayType.ID,'text');
        TypeMap.put(Schema.DisplayType.PICKLIST,'text');
        TypeMap.put(Schema.DisplayType.MULTIPICKLIST,'text');
        TypeMap.put(Schema.DisplayType.Email,'email');
        TypeMap.put(Schema.DisplayType.Phone,'Phone');
        TypeMap.put(Schema.DisplayType.REFERENCE,'reference');
        TypeMap.put(Schema.DisplayType.INTEGER,'number');
        TypeMap.put(Schema.DisplayType.LONG,'number');
        TypeMap.put(Schema.DisplayType.CURRENCY,'currency');
        TypeMap.put(Schema.DisplayType.DOUBLE,'number');
        TypeMap.put(Schema.DisplayType.BOOLEAN,'boolean');
        TypeMap.put(Schema.DisplayType.PERCENT,'percent');
        
        return TypeMap;
        
    }

    @AuraEnabled
    public static SDGWrapper getRuleData(string ruleName,string recId){
        SDGWrapper wrap = new SDGWrapper();
        wrap.sdgList = [Select Id,Name,Columns__c,Condition__c,Fields__c,Object_Name__c,Relationship_Field__c,Rule_Name__c FROM SDG__c WHERE Rule_Name__c =:ruleName];
        if(wrap.sdgList.size() > 0){
            SDG__c sdg = wrap.sdgList[0];
            string query = 'SELECT ';
            query += sdg.Fields__c + ' FROM ';
            query += sdg.Object_Name__c + ' WHERE ';
            query += sdg.Relationship_Field__c + '=' + '\'' + recId + '\'';
            system.debug('Condition---' + sdg.Condition__c);
            if(sdg.Condition__c != null && sdg.Condition__c != ''){
                query += ' AND ' + sdg.Condition__c;
            }
            system.debug('query--' + query);
            wrap.childRecs = Database.query(query);
        }
        return wrap;

    }

    public class SDGWrapper{
        @AuraEnabled public List<SObject> childRecs;
        @AuraEnabled public List<SDG__c> sdgList;
        public SDGWrapper(){
            childRecs = new List<Sobject>();
            sdgList = new List<SDG__c>();
        }
    }
}