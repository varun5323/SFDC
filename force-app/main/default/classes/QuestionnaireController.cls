public class QuestionnaireController {
    
    @AuraEnabled
    public static returnWrapper getQuestions(String TemplateName){
        returnWrapper rw = new returnWrapper();
        rw.items = [Select id,
                    name,
                    Label__c,
                    type__c,
                    order__c,
                    Picklist_Values__c,
                    Styles__c,
                    Attributes__c,
                    Label_Styles__c
                    from Questionnaire_item__c WHERE Template__r.Name = :TemplateName ORDER BY  Order__c,Group__c ASC];
        rw.styles = [SELECT Id,
                     DeveloperName,
                     Label,
                     QualifiedApiName,
                     Question_Type__c,
                     Styles__c,
                     MasterLabel
                     FROM Questionnaire_Settings__mdt];
        Map<String,Questionnaire_Label_Styles__mdt> styleMap = new Map<String,Questionnaire_Label_Styles__mdt>();
        for(Questionnaire_Label_Styles__mdt style : [SELECT Id, 
                                                     DeveloperName,
                                                     MasterLabel, 
                                                     Language,
                                                     NamespacePrefix,
                                                     Label, 
                                                     QualifiedApiName, 
                                                     Label_Style__c
                                                     FROM Questionnaire_Label_Styles__mdt ]){
                                                         
                                                         styleMap.put(style.DeveloperName, style);
                                                     }
        rw.labelStyle = styleMap.get('DefaultLabelStyle').Label_Style__c;
        rw.formStyle = styleMap.get('FormDefaultStyle').Label_Style__c;
        
        return rw;
    }
    
    @AuraEnabled
    public static List<Questionnaire_Settings__mdt> getStyles(){
        return [SELECT Id, DeveloperName, Label, QualifiedApiName, Question_Type__c, Styles__c, MasterLabel FROM Questionnaire_Settings__mdt];
    }
    
    public class returnWrapper{
        @AuraEnabled public List<Questionnaire_item__c> items;
        @AuraEnabled public List<Questionnaire_Settings__mdt> styles;
        @AuraEnabled public String labelStyle;
        @AuraEnabled public String formStyle;
    }
}