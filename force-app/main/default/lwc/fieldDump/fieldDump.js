import { LightningElement,track,wire } from 'lwc';
import getObjects from '@salesforce/apex/FieldDumpController.getObjects';
import getFields from '@salesforce/apex/FieldDumpController.getFields';
import getFieldsList from '@salesforce/apex/FieldDumpController.getFieldsList';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class FieldDump extends LightningElement {
    listOptions;
    selectedValues =[];
    seeAll = false;
    radiocheck = 'default';
    oneCsv = true;
    connectedCallback(){
        getObjects({radio:this.radiocheck,seeAll :this.seeAll})
        .then(result=>{
            this.listOptions= result;
        })
        .catch(error=>{
           this.dispatchEvent(new ShowToastEvent({
               title : "Error Getting Objects",
               message: error,
               variant : "error"
           }));
        })
    
    }
    handleListChange(event){
        this.selectedValues = event.detail.value;
    }
    
    handleRadioChange(event){
        this.radiocheck = event.target.value;
        if(this.radiocheck == 'noncs'){
            this.seeAll = true;
        }else{
            this.seeAll = false;
        }
        this.callgetObjects();
    }

    handleCheckChange(event){
        this.oneCsv = !(event.target.checked);
    }

    callgetObjects(){
        getObjects({radio:this.radiocheck,seeAll :this.seeAll})
        .then(result=>{
            this.listOptions= result;
        })
        .catch(error=>{
            this.dispatchEvent(new ShowToastEvent({
                title : "Error Getting Objects",
                message: error,
                variant : "error"
            }));
        })
    }

    downloadCsv(){
        if(this.selectedValues.length == 0){
            alert('Select atleast one object');
            return;
        }
        if(this.oneCsv){
            this.fieldListDownload(this.selectedValues);
        }else{
            this.selectedValues.forEach(function(obj){
                let oneVal = [];
                oneVal.push(obj);
                getFieldsList({objName:oneVal,One: false})
                .then(resultNew=>{
                    console.log('result--' + JSON.stringify(resultNew));
                    var encodedUri = resultNew;
                    var link = document.createElement("a");
                    link.setAttribute("href", "data:text/csv;charset=utf-8,"+encodedUri);
                    link.setAttribute("download", obj+".csv");
                    document.body.appendChild(link); // Required for FF

                    link.click();
                })
                .catch(error=>{
                    this.dispatchEvent(new ShowToastEvent({
                        title : "Error Getting Field Describe",
                        message: error,
                        variant : "error"
                    }));
                })
            });
        }
        
    }

    fieldListDownload(objectList){
        getFieldsList({objName:objectList,One: this.oneCsv})
        .then(resultNew=>{
            var t = new Date().getTime() / 1000;
            console.log('result--' + JSON.stringify(resultNew));
            var encodedUri = resultNew;
            var link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8,"+encodedUri);
            link.setAttribute("download", "FieldDescibe-"+t+".csv");
            document.body.appendChild(link); // Required for FF

            link.click();
        })
        .catch(error=>{
            this.dispatchEvent(new ShowToastEvent({
                title : "Error Getting Field Describe",
                message: error,
                variant : "error"
            }));
        })
    }

}