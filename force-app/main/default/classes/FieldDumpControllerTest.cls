@IsTest
public with sharing class FieldDumpControllerTest {
    @IsTest
    static void getObjectsTest(){
        FieldDumpController.getObjects('noncs',false);
        FieldDumpController.getObjects('default',false);
        FieldDumpController.getObjects('cs',false);
        
    }
    @IsTest
    static void getFieldsTest(){
        List<String> objs = new List<String>{'Account','Case','Contact'};
        FieldDumpController.getFieldsList(objs,true);
        FieldDumpController.getFieldsList(objs,false);
        
        
    }
}