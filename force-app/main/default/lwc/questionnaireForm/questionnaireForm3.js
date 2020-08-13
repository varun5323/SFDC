import { LightningElement } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionnaireController.getQuestions' ;
export default class QuestionnaireForm extends LightningElement {

    columns;
    data;
    rand = 0;
    templateName = 'c-questionnaireform_questionnaireform';
    connectedCallback(){
        this.columns = [
            { label: 'Id', fieldName: 'Id' },
            { label: 'Name', fieldName: 'Name' },
            { label: 'Label', fieldName: 'Label__c' },
            { label: 'Type', fieldName: 'Type__c' },
            { label: 'Order', fieldName: 'Order__c' }
        ];
        getQuestions({TemplateName:'Dealer Onboarding'})
        .then(result=>{
            this.data = result;
            console.log('Results--' + JSON.stringify(result))
        })
        .catch(error=>{
            console.log('Error--' + error);
        })
    }
    
    buildForm(){
        var inputTypes = 'text,checkbox,date,datetime-local,email,phone,radio,tel';
        this.data.forEach(element => {
            if(inputTypes.includes(element.Type__c.toLowerCase())){ //If Question Types fall under Input types
                var attributes = ''; //To Set Attributes for the tag
                attributes += 'type:'+element.Type__c + ';';
                attributes += 'placeholder:' + element.Label__c;
                if(element.Type__c.toLowerCase() == 'checkbox'){
                    this.buildElement('input','mainDiv',element.Label__c,attributes,'buildCheckBoxLabel',false);
                    this.buildBreak('mainDiv');
                }else{
                    this.buildElement('input','mainDiv',element.Label__c,attributes);
                }
                
            }else if(element.Type__c.toLowerCase() == 'drop down'){ //For Drop Down Picklist
                console.log('elem picks---' + element.Picklist_Values__c);
                this. buildDropDown('mainDiv',element.Picklist_Values__c,element.Label__c,null,'buildLabel',true);
            }
        });
        
    }

    buildElement(elemType,parentElem,labelVal='',attributes='',labelType='buildLabel',breakOn=true){
        var datId = '[data-id="' + parentElem + '"]';
        var parentElement = this.template.querySelector(datId);
        var childElement = document.createElement(elemType);
        this.appendTag(parentElement,childElement);
        childElement.onchange = this.handleChange;
        if(attributes.length > 0){
            var eachAttr = attributes.split(';')
            eachAttr.forEach(element=>{
                var atType = element.split(':')[0];
                var atVal = element.split(':')[1];
                childElement.setAttribute(atType,atVal);
            })
        }
        if(labelType == 'buildCheckBoxLabel'){
            this.buildCheckBoxLabel(labelVal,false);
        }else{
            this.buildLabel(labelVal,false);
        }
        parentElement.appendChild(childElement);

    }

    buildDropDown(parentElem,pickValues='--None--',labelVal='',attributes='',labelType='buildLabel',breakOn=true){

        var datId = '[data-id="' + parentElem + '"]';
        if(labelType == 'buildCheckBoxLabel'){
            this.buildCheckBoxLabel(labelVal,false);
        }else{
            this.buildLabel(labelVal,false);
        }
        var parentElement = this.template.querySelector(datId);
        var select = document.createElement('select');
        console.log('pickValues--' + pickValues);
        var pickVals = pickValues.split(';');
        console.log('pickVals--' + pickVals);
        select.setAttribute(this.templateName,'')
        parentElement.appendChild(select);
        pickVals.forEach(pickVal=>{
            console.log('pickVal--' + pickVal);
            var option = document.createElement("option");
            option.value = pickVal;
            option.text = pickVal;
            select.appendChild(option);
        });
        //parentElement.appendChild(document.createElement('br'));
    }

    buildTextArea(parentElem,labelVal='',attributes='',labelType='buildLabel',breakOn=true){

    }

    buildBreak(parentElem){
        var datId = '[data-id="' + parentElem + '"]';
        var parentElement = this.template.querySelector(datId);
        parentElement.appendChild(document.createElement('br'));

    }

    appendTag(parentElement,childElement){
        parentElement.appendChild(childElement);
        childElement.setAttribute(this.templateName,'');
    }
    
    buildCheckBoxLabel(labelVal,breakOn=true){
        var form = this.template.querySelector('[data-id="mainDiv"]');
        form.appendChild(document.createElement('br'));
        var para = document.createElement('p');
        para.setAttribute(this.templateName,'');
        para.setAttribute('style','display:inline;font-size:15px;margin:0 0 1% 1%');
        para.innerHTML = labelVal;
        form.appendChild(para);
        if(breakOn)
            form.appendChild(document.createElement('br'));
    }

    buildLabel(labelVal,breakOn){
        var form = this.template.querySelector('[data-id="mainDiv"]');
        form.appendChild(document.createElement('br'));
        var label = document.createElement('label');
        label.setAttribute(this.templateName,'');
        label.innerHTML = labelVal;
        form.appendChild(label);
        if(breakOn)
            form.appendChild(document.createElement('br'));
    }

    handleChange(event){
        console.log('Called HandleChange--' + event.target.value);
    }

    
}