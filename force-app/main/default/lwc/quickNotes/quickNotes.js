import { LightningElement,wire,api,track } from 'lwc';
import getNotes from '@salesforce/apex/QuickNotesController.getNotes';
import upsertNotes from '@salesforce/apex/QuickNotesController.upsertNotes';
import deleteNotes from '@salesforce/apex/QuickNotesController.deleteNotes';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';


export default class QuickNotes extends LightningElement {
    fieldLength = '32768';
    usedLength = this.fieldLength - 0;
    inpText;
    changedText;
    @api recordId;
    focus = false;
    @track quickNoteRecord ={
        Record_Id__c : '',
        Notes__c : ''
    }
    //Getting Current Record Notes
    @wire(getNotes,{recId:'$recordId'}) Notes({
        data,
        error
    }){
        if(data){
            this.inpText = data.Notes__c;
            this.usedLength = this.fieldLength - data.Notes__c.length;
        }else if(error){
            this.dispatchEvent(new ShowToastEvent({
                title :' Failed to Load Notes',
                message : error.message,
                variant : 'Error'
            }))
        }
    }
    
    //Handling Mouse Out event
    handleMouseOut(event){
        if(this.focus){ //Calling only when focused first and then mouse out
            var textarea = this.template.querySelector("textarea");
            textarea.blur(); //Making texta area out of focus on mouse out
            this.quickNoteRecord.Record_Id__c = this.recordId;
            this.quickNoteRecord.Notes__c = event.target.value;
            //If Empty Notes remove the record from quick notes else upsert
            if(event.target.value == ''){
                deleteNotes({recId : this.recordId})
                .then(result=>{
                    console.log('Notes Deleted--' + result);
                })
                .catch(error=>{
                    console.log('Error Deleting--' + error.message);
                })
            }else{
                upsertNotes({q: this.quickNoteRecord})
                .then(result=>{
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message : 'Notes Updated',
                        variant: 'success'
                    }))
                    console.log('Result---' + result)
                })
                .catch(error=>{
                    console.log('Error upserting---' + error.message)
                })
            }
            

        }    
        else
            console.log('Simple MouseOut');
    }

    handleFocusOn(event){
        this.focus = true;
    }

    handleFocusOut(event){
        this.focus = false;
    }
    
    //Find Field Length to update Characters Left
    changeCount(event){
        this.usedLength = this.fieldLength - event.target.value.length;
    }
   
    connectedCallback(){
        
    }
}