/*
* Author : Varun Kathepally
* Date : 07/19/2020

*/
public with sharing class FieldDumpController {
    private static string csvHeader = '"Object","API Name","Label","Type","Is Custom","Is External ID","Is Unique","Is Formula","Is Required","Dependent Picklist","Length","Help Text","Picklist Values"\n';
    @AuraEnabled
    public static List<ObjectWrapper> getObjects(String radio,Boolean seeAll){
        List<ObjectWrapper> objw = new List<ObjectWrapper>();
        map<string, SObjectType> objs = schema.getGlobalDescribe();
        List<String> defaultObjs = new List<String>{'ACCOUNT','CONTACT','CASE','OPPORTUNITY','QUOTE','EVENT','TASK','USER'};
        List<String> objskeys = new List<String>();
        Map<String,FieldDump__c> csObjectList = FieldDump__c.getAll();
        List<String> csObjects = new List<String>(); //Objects List from Custom Settings
        for(String f : csObjectList.keySet()){
            csObjects.add(f.toUpperCase());
        }
        objskeys.addAll(objs.keySet());
        objsKeys.sort();
        for(string key: objsKeys){
            if(!seeAll){
                system.debug('--Entering not see All');
                if(radio == 'noncs'){
                    system.debug('--Entering noncs');
                    if(key.containsIgnoreCase('__') && !key.endswith('__c')){
                        continue;
                    }
                    if(ignoreStdObject(key)){
                        continue;
                    }
                }else if(radio == 'default'){
                    system.debug('--Entering default--' + key);
                    if(!key.endswith('__c') && !defaultObjs.contains(key.toUpperCase())){
                        continue;
                    }
                }else if(radio == 'cs'){
                    if(!csObjects.contains(key.toUpperCase())){
                        continue;
                    }
                    
                }
            }
            ObjectWrapper obj  = new ObjectWrapper();
            obj.label = key.toUpperCase() + ' (' + (objs.get(key).getDescribe().getName()).toUpperCase() +')' ;
            obj.value = key.toUpperCase();
            objw.add(obj);
			system.debug('--'+obj);           
        }
        return objw;
    }
    
    @TestVisible
    private static Boolean ignoreStdObject(String key){
        if(!key.containsIgnoreCase('__')
           && (key.containsIgnoreCase('share') 
               || key.containsIgnoreCase('history') 
               || key.containsIgnoreCase('changeevent')
               || key.containsIgnoreCase('security')
               || key.containsIgnoreCase('layout')
               || key.containsIgnoreCase('config')
               || key.containsIgnoreCase('feed')
               || key.containsIgnoreCase('stream')
               || key.containsIgnoreCase('domain')
               || key.containsIgnoreCase('relation')
               || key.containsIgnoreCase('record')
               || key.containsIgnoreCase('chat')
               || key.containsIgnoreCase('comment')
               || key.startswith('apex')
               || (key.containsIgnoreCase('event') && key.length() > 5)
               
              )
          ){
              return true;
          }
        return false;
    }
    @AuraEnabled
    public static String getFieldsList(List<String> objName,Boolean One){
        String csv  = csvHeader;
        if(One){
            for(String s :objName){
                csv += getFields(s);
            }
        	
        }else{
            if(objName.size() > 0){
                csv += getFields(objName[0]);
            }
        }
        
        return csv;
        
    }
    @AuraEnabled
    public static String getFields(String objName){
        //buildTypeMap
        string rowEnd = '\n';
        String csv = '';
        
        Map<String,Schema.SObjectField> fieldsMap = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap() ; 
        List<String> fieldList = new List<String>();
        fieldList.addAll(fieldsMap.keySet());
        fieldList.sort();
        for(String f : fieldList){
            Schema.DescribeFieldResult fd = fieldsMap.get(f).getDescribe();
            //Object Name
            csv += buildquotes(objName);
            //API Name
            csv += buildquotes(fd.getName());
            //Label
            csv += buildquotes(fd.getLabel());
            //Is Reference Start
            if(fd.getType() == Schema.DisplayType.REFERENCE){
                csv += '"'+fd.getType() + '(';
                Integer refLen = fd.getReferenceTo().size();
                Integer count = 0;
                system.debug('len--' + refLen);
                for(Schema.SObjectType reference : fd.getReferenceTo()){
                    count += 1;
                    csv +=  reference.getDescribe().getName();
                    if(count != refLen){
                        csv += ',';
                    }
                }
                csv += ')",';
            }else{
                csv += buildquotes(fd.getType());
            }
            //Is Reference End
            
            csv += buildquotes(fd.isCustom());//Is Custom
            csv += buildquotes(fd.isExternalId());//Is External ID        
            csv += buildquotes(fd.isUnique());// Is Unique
            csv += buildquotes(fd.isCalculated());// Is Formula
            csv += buildquotes(!(fd.isNillable()));// Is Required
            csv += buildquotes(fd.isDependentPicklist());// Is Dependent Picklist
            csv += buildquotes(fd.getLength());// Length
            csv += buildquotes(fd.getInlineHelpText());// Help Text
            
            if(fd.getType() == Schema.DisplayType.PICKLIST){
                csv += '"';
                for(Schema.PicklistEntry pickListVal : fd.getPicklistValues() ){
                    csv += pickListVal.getLabel() + '\n';
                }
                csv += '",';
            }
	            
            
            
            csv.removeEnd(',');
            csv += rowEnd;
            
            system.debug('Name--' + fd.getName());
        }
        
        return csv;
    }
	
    private static string buildquotes(String s){
        return '"'+s+'",';
    }
    private static string buildquotes(Schema.DisplayType s){
        return '"'+s+'",';
    }
    private static string buildquotes(Boolean s){
        return '"'+s+'",';
    }
    private static string buildquotes(Integer s){
        return '"'+s+'",';
    }
    private static string buildquotes(Schema.DescribeFieldResult s){
        return '"'+s+'",';
    }
    public class ObjectWrapper{
        @AuraEnabled public String value;
        @AuraEnabled public String label;
    }
    
    
    
    
}
