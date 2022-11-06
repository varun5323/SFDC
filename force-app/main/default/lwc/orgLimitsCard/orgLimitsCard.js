import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OrgLimitsCard extends LightningElement {
    @api limit;
    @track limitSnapShots = [];
    @track snapShot = {}
    noSnapShots = false;
    showSnapShot = false;
    iconDetail = 'utility:chevronright';
    snapShotButtonTitle = 'Show';
    showEdit = false;
    @api fields;
    @api viewFields;
    @api snapShotFields;
    connectedCallback(){
        this.buildSnapShots();
    }

    @api buildSnapShots(){
        
        this.limitSnapShots = this.limit?.Limit_Snapshot__r || [];
        if(this.limitSnapShots?.length > 0){
            this.noSnapShots = false;
            this.snapShot = this.limitSnapShots[0];
        }else{
            this.noSnapShots = true;
        }
    }

    @api toggleSnapShot(){
        this.showSnapShot = this.showSnapShot ? false : true;
        this.iconDetail = this.showSnapShot ? 'utility:chevrondown' : 'utility:chevronright';
        this.snapShotButtonTitle = this.showSnapShot ? 'Hide' : 'Show';
    }

    @api expandCollapse(isExpand){
        if(isExpand){
            this.showSnapShot = true;
            this.iconDetail = 'utility:chevrondown';
            this.snapShotButtonTitle = 'Hide';
        }else{
            this.showSnapShot = false;
            this.iconDetail = 'utility:chevronright';
            this.snapShotButtonTitle = 'Show';
        }
    }


    /**Edit Form */
    saveClick(e)
    {
        const inputFields = e.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(inputFields);
    }
    validateFields() {
        return [...this.template.querySelectorAll("lightning-input-field")].reduce((validSoFar, field) => {
            return (validSoFar && field.reportValidity());
        }, true);
    }
    handleSuccess(e)
    {
        this.showMessage('Record Saved Successfully','success');
        this.toggleEdit();
        this.dispatchEvent(new CustomEvent('success'));
    }
    handleError(e)
    {
        this.template.querySelector('[data-id="message"]').setError(e.detail.detail);
        e.preventDefault();
    }

    showMessage(message,variant)
    {
        const event = new ShowToastEvent({
            title: 'Record Save',
            variant: variant,
            mode: 'dismissable',
            message: message
        });
        this.dispatchEvent(event);
    }

    toggleEdit(){
        this.showEdit = this.showEdit ? false : true;
    }
}