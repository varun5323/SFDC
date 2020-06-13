public with sharing class LWCController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        return [Select Id,Name from Account];
    }
}
