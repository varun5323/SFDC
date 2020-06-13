public class mergeTriggerBeforeUpdateHandler {

    public static void populateExternalId(List<Merge_Records__c > newList){
        for(Merge_Records__c m : newList){
            m.ext_ref_id__c = m.Master_Record__c + '-' + m.Merging_Record__c;
        }
    }
}