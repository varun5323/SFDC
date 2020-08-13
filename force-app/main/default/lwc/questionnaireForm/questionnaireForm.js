import { LightningElement,api } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionnaireController.getQuestions' ;
import getStyles from '@salesforce/apex/QuestionnaireController.getStyles' ;
export default class QuestionnaireForm extends LightningElement {

    columns;
    data;
    rand = 0;
    templateName = 'c-questionnaireform_questionnaireform';
    //formDivDatId = '[data-id="mainDiv"]';
    formDivDatId = 'form';
    formElement;
    defaultStyles;
    defaultLabelStyles;
    defaultFormStyles;
    defaultFormHeadStyles;
    styleMap;
    formBuilt = false;
    @api QuestionTemplate;
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
            this.data = result.items;
            this.defaultStyles = result.styles;
            this.defaultLabelStyles = result.labelStyle;
            this.defaultFormStyles = result.formStyle;
            this.defaultFormHeadStyles = result.formHeadStyle;
            var sMap  = new Object();
            this.defaultStyles.forEach(element=>{
                sMap[element.Question_Type__c.toLowerCase()]= element.Styles__c;
            })
            this.styleMap = sMap;
            

            console.log('Results--' + JSON.stringify(result));
        })
        .catch(error=>{
            console.log('Error--' + error);
        });
    }
   
    buildForm(){
        if(this.formBuilt){
            return;
        }
            
        this.formBuilt = true;
        var parentElement = this.template.querySelector(this.formDivDatId);
        parentElement.setAttribute('style',this.defaultFormStyles);
        this.formElement = parentElement;
        console.log('QuestionTemplate--' + this.QuestionTemplate);
        this.buildElement('h1',this.formElement,'','',this.defaultFormHeadStyles,null,this.QuestionTemplate);
        var inputTypes = 'text,checkbox,date,datetime-local,email,phone,radio,tel';
        var selectType = 'drop down';
        var textareaType = 'textarea';
        console.log('QuestionTemplate--' + this.QuestionTemplate);
        
        this.data.forEach(eachRow=>{
            var qType = eachRow.Type__c.toLowerCase();
            console.log('eachRow--' + JSON.stringify(eachRow));
            var attributes= this.buildAttributes(qType,eachRow,true);
            var styles = this.buildStyles(qType,eachRow);
            var labelStyles = this.buildLabelStyles(qType,eachRow);
            if(inputTypes.includes(qType)){ //If falls under input Types
                console.log('qType--' + qType);
                console.log('attributes start--' + attributes);
                console.log('labelStyles--' + labelStyles);
                this.buildLabel(this.formElement,qType,labelStyles,eachRow.Label__c,eachRow);
                this.buildElement('input',this.formElement,qType,attributes,styles,eachRow);
            }else if(selectType.includes(qType)){
                this.buildLabel(this.formElement,qType,labelStyles,eachRow.Label__c,eachRow);
                this.buildElement('select',this.formElement,qType,attributes,styles,eachRow);
            }else if(textareaType.includes(qType)){
                this.buildLabel(this.formElement,qType,labelStyles,eachRow.Label__c,eachRow);
                this.buildElement('textarea',this.formElement,qType,attributes,styles,eachRow);
            }
        });
        

    }

    buildElement(elementType,parentElement,qType,attributes='',styles='',eachRow=null,HtmlVal=''){
        console.log('buildElement Called --' + '--elementType--' + elementType + '--qType--' + qType + '--HtmlVal--' + HtmlVal + '--eachRow--' + eachRow);
        var childElement = document.createElement(elementType);
        if(HtmlVal.length > 0){
            childElement.innerHTML = HtmlVal;
        }
        if(eachRow !=null){
            childElement.setAttribute('data-id',eachRow.Short_Name__c);
            childElement.setAttribute('id',eachRow.Short_Name__c);
            if(eachRow.Questionnaire_Items__r != undefined){
                var shortNames = '';
                eachRow.Questionnaire_Items__r.forEach(qi=>{
                    shortNames += qi.Short_Name__c+';';
                })
                childElement.setAttribute('data-dependentques',shortNames);

            }
        }
        
        
        this.appendTag(parentElement,childElement);
        if(qType == 'checkbox'){
            this.buildBreak(parentElement);
        }
        if(qType == 'drop down'){
            this.buildOptions(childElement,eachRow.Picklist_Values__c);
        }
        if(attributes.length > 0){
            var attList = attributes.split(';');
            attList.forEach(element => {
                if(element.length > 0){
                    var attName = element.split(':')[0];
                    var attVal = element.split(':')[1];
                    childElement.setAttribute(attName,attVal);
                }
                
            });
        }
        childElement.setAttribute('style',styles);
    }

    buildOptions(selectElement,picklistValues){
        var pickVals = picklistValues.split(';');
        pickVals.forEach(pickVal=>{
            console.log('pickVal--' + pickVal);
            var option = document.createElement("option");
            option.value = pickVal;
            option.text = pickVal;
            selectElement.appendChild(option);
        });
    }

    buildLabel(parentElement,type,styles='',HtmlVal='Hello',eachRow=null){
        console.log('buildLabel Called');
        this.buildBreak(parentElement);
        var childElement = document.createElement('label');
        childElement.setAttribute('style',styles);
        if(eachRow != null){
            childElement.setAttribute('data-id',eachRow.Short_Name__c+'label');
            childElement.setAttribute('id',eachRow.Short_Name__c+'label');
        }
        childElement.innerHTML = HtmlVal;
        this.appendTag(parentElement,childElement);
        
    }

    buildBreak(parentElement){
        console.log('buildBreak Called');
        parentElement.appendChild(document.createElement('br'));
    }

    appendTag(parentElement,childElement){
        console.log('appendTag Called');
        childElement.setAttribute(this.templateName,'');
        childElement.onchange = this.handleChange;
        parentElement.appendChild(childElement);
    }

    buildStyles(qType,eachRow){
        var styles = '';
        if(qType == 'checkbox'){
            styles += 'margin-bottom:2%;';
        }
        
        if(eachRow.Styles__c != undefined && eachRow.Styles__c != '' && eachRow.Styles__c != 'default'){
            styles += eachRow.Styles__c + ';';
        }
        if(this.styleMap[qType] != undefined){
            styles += this.styleMap[qType];
        }
        return styles;
        
    }

    buildAttributes(qType,eachRow,isInput=false){
        var attributes = '';
        if(isInput){
            attributes += 'type:'+qType+';';
        }
        if(qType == 'textarea'){
            attributes += 'rows:10;cols:10';
        }
        if(eachRow.Attributes__c != '' && eachRow.Attributes__c != 'default' && eachRow.Attributes__c != undefined){
            attributes += eachRow.Attributes__c;
        }

        return attributes;

    }

    buildLabelStyles(qType,eachRow){
        console.log('buildLabelStyles Called--' + this.defaultLabelStyles);
        var labelStyles = this.defaultLabelStyles != undefined ? this.defaultLabelStyles:'';
        if(qType == 'checkbox'){
            labelStyles += 'display:inline;';
        }
        if(eachRow.Label_Styles__c != '' && eachRow.Label_Styles__c != 'default' && eachRow.Label_Styles__c != undefined){
            labelStyles += eachRow.Label_Styles__c+';';
        }
        

        return labelStyles;
    }

    handleChange(event){
        console.log('Value is--' + event.target.value);
        var dependentques = event.target.dataset.dependentques;
        var dependentquesList = [];
        if(dependentques.length > 0){
            dependentquesList = dependentques.split(';');
        }
        /*var templ = document.querySelector('form');
        console.log('templ1---' + templ);*/
        dependentquesList.forEach(dq=>{
            var datId = '#'+dq;
            var labelId = '#'+dq+'label';
            var elem = document.querySelector(datId);
            elem.setAttribute('hidden','true');
            var labelElem = document.querySelector(labelId);
            labelElem.previousElementSibling.setAttribute('style','display:none');
            labelElem.setAttribute('style','display:none');

        })
        console.log('DataSet--' + event.target.dataset.dependentques);

    }
}