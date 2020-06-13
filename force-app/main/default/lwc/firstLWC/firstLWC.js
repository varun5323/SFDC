import { LightningElement,track,wire } from 'lwc';
import getAccounts from '@salesforce/apex/LWCController.getAccounts';


let columns = [
    { label: 'Account Id', fieldName: 'Id' ,type:'text'},
    { label: 'Name', fieldName: 'Name' ,type:'text'}
    
];

//let inp = this.template.querySelector("input[type=text]");
//inp.value = 'Hello World';

export default class FirstLWC extends LightningElement {
    accList;
    columns = columns;
    inpValue = 'Enter Data';
    inpDom;
    //On Load Method
    connectedCallback(){
        this.myName = 'Munna';
       
    }
    @wire(getAccounts) wiredData({
        error,
        data
    }){
        if(data){
            this.accList = data;
        }else if(error){
            this.error = error;
        }
    }
    
    handleChange(event){
        this.inpValue = event.target.value;
        this.inpDom = this.template.querySelector("p[data-id=finalData]");
        this.inpDom.innerHTML = this.inpDom.getAtt;
        console.log('--Data--' + this.inpDom)
        
    }
}