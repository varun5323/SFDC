import { LightningElement,api,wire } from 'lwc';
import getFieldTypes from '@salesforce/apex/SDGController.getFieldTypes';
import getRelatedRecords from '@salesforce/apex/SDGController.getRelatedRecords';
import getRuleData from '@salesforce/apex/SDGController.getRuleData';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class SDG extends LightningElement {
    @api FieldNames;
    @api RealtionField;
    @api ChildObject;
    @api recordId;
    @api RuleName;
    @api Condition
    FieldNamesRefined='';
    columns;
    data;
    initColumns = [];
    typemap;
    containsReference = false;
    referenceFields = [];
    dotFields =[];
    areDetailsVisible = false;
    btnName = 'Show SDG Details';
    hasRuleName = false;
    sdgDetails ={
        childObjectName : '',
        relationName : '',
        fields : '',
        columns : '',
        condition : '',
        ruleName : ''

    }
    connectedCallback(){
        if(this.RuleName == '' || this.RuleName == null){
             //SDG DETAILS - START
             this.sdgDetails.childObjectName = this.ChildObject;
             this.sdgDetails.relationName = this.RealtionField;
             this.sdgDetails.fields = this.FieldNames;
             this.sdgDetails.columns = this.FieldNames;
             this.sdgDetails.condition = this.Condition;
             //this.sdgDetails.ruleName = result.sdgList[0].Rule_Name__c;
             //SDG DETAILS - END
            this.initData();
        }
        else{
            this.hasRuleName =true;
            this.ruleData();
        }
    }

    initData(){
        if(this.FieldNames == null || this.RealtionField == null || this.ChildObject == null){
            this.dispatchEvent(new ShowToastEvent({
                title : 'Fields Names OR RelationField OR ChildObject is not provided',
                message : 'Please fill Field Names & RelationField & ChildObject design Attributes',
                variant : 'error'
            }));
        }else{
            this.refineFieldNames();
            this.fieldTypes();  //GET FIELD TYPES
            this.relatedRecords();//GET CHILD RECORDS  
        }
        
    }

    fieldTypes(){
        getFieldTypes({fields:this.FieldNamesRefined,ObjectName:this.ChildObject})
        .then(result=>{
            this.typemap = result;
            for (let [key, value] of Object.entries(result)) {
                console.log(`${key}: ${value}`);
                if(value == 'reference'){
                    this.containsReference = true;
                    this.referenceFields.push(key); 
                    var tempLink = key+'_link';
                    this.initColumns.push({label:key,fieldName:tempLink,type:'url',editable:true,typeAttributes:{target:'_blank',label:{fieldName:key}}});

                }else if(key.includes('.')){
                    this.dotFields.push(key);
                    let tempKey = key.replace('.','');
                    this.initColumns.push({label:tempKey,fieldName:tempKey,type:value,sortable:true,editable:true});
                }else{
                    this.initColumns.push({label:key,fieldName:key,type:value,sortable:true,editable:true});
                }    
            }
            this.columns = this.initColumns;
        })
        .catch(error=>{
            console.log('Error Apex--' + error.message);
        });
    }

    //METHOD TO GET RELATED RECORDS
    relatedRecords(){
        getRelatedRecords({
            fields:this.FieldNamesRefined,
            ObjectName:this.ChildObject,
            Condition: this.Condition,
            RelationField : this.RealtionField,
            recId : this.recordId
        })
        .then(result=>{
            console.log('typemap' + JSON.stringify(this.typemap));
            console.log('Child recs---' + JSON.stringify(result));
            if(this.referenceFields.length > 0){ //SETTING LINK TO REFERENCE TYPE FIELDS
                this.referenceFields.forEach(function(a){
                    result.forEach(function(res){
                        res[a+'_link'] = '/'+res[a];
                    })
                })
                console.log('containsReference---' + this.referenceFields);
            }
            if(this.dotFields.length > 0){ //SETTING NAMES TO PARENT FIELDS
                this.dotFields.forEach(function(a){                 
                    var newfield = a.replace('.','');
                    var objName = a.split('.')[0];
                    var fieldName = a.split('.')[1];
                    result.forEach(function(res){
                        console.log('Field Value--' + res[objName][fieldName])
                        res[newfield] = res[objName][fieldName];
                    })
                })
            }

            console.log('results--' + JSON.stringify(result));
            this.data = result;
        })
        .catch(error=>{
            this.dispatchEvent(new ShowToastEvent({
                title : 'Error Retreiving Child Records',
                message : error.message,
                variant : 'Error'
            }));
            console.log('Error Apex Child recs--' + error.message);
        })
    }

    //METHOD TO REMOVE EXTRA COMMAS IN FIELD NAME DESIGN ATTRIBUTE
    refineFieldNames(){
        this.FieldNames.split(',').forEach(element => {
            if(element != ''){
                this.FieldNamesRefined += element + ',';
            }
            console.log('element---' + element);
        });
        this.FieldNamesRefined =  this.FieldNamesRefined.replace(/,\s*$/, "");
    }

    ruleData(){
        getRuleData({
            ruleName : this.RuleName,
            recId : this.recordId
        })
        .then(result=>{
            console.log('---Result--' + JSON.stringify(result));
            //SDG DETAILS - START
            this.sdgDetails.childObjectName = result.sdgList[0].Object_Name__c;
            this.sdgDetails.relationName = result.sdgList[0].Relationship_Field__c;
            this.sdgDetails.fields = result.sdgList[0].Fields__c;
            this.sdgDetails.columns = result.sdgList[0].Columns__c;
            this.sdgDetails.condition = result.sdgList[0].Condition__c;
            this.sdgDetails.ruleName = result.sdgList[0].Rule_Name__c;
            //SDG DETAILS - END

            var sdgcols = result.sdgList[0].Columns__c;
            var colsList = JSON.stringify(sdgcols).split(';');
            var tempCols = [];
            colsList.forEach(function(a){
                a = a.replace('\\r','');
                a = a.replace('\\n','');
                a = a.replace(/^"|"$/g, '');
                a = a.replace(/\\/g,'');
                tempCols.push(JSON.parse(a));
            })
            console.log('tempCols---' + tempCols);
            this.columns = tempCols;
            this.data = result.childRecs;
        })
        .catch(error=>{
            this.dispatchEvent(new ShowToastEvent({
                title : 'Error Getting Child records',
                message : error.body.message,
                variant : 'error'
            }));
            console.log('Error--' + JSON.stringify(error));
        })
    }

    showDetails(event){
        
        if(this.areDetailsVisible){
            this.btnName = 'Show SDG Details';
            this.areDetailsVisible = false;
        }else{
            this.btnName = 'Hide SDG Details';
            this.areDetailsVisible = true;
        }
        
    }

}