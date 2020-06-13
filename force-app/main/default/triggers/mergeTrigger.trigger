trigger mergeTrigger on Merge_Records__c (before insert,before update) {

    if((trigger.isinsert || trigger.isupdate) && trigger.isbefore){
        mergeTriggerBeforeUpdateHandler.populateExternalId(trigger.new);
    }
}