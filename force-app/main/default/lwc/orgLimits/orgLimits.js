import { LightningElement,track } from 'lwc';
import getOrgLimits from '@salesforce/apex/LimitsUtil.getSnapShots';
import getForm from '@salesforce/apex/LimitsUtil.getForm';
import createSnapShotOnDemand from '@salesforce/apex/LimitsUtil.createSnapShotOnDemand';
export default class OrgLimits extends LightningElement {
    

    @track OrgLimits = [];
    @track filteredOrgLimits = [];
    searchKey = '';
    fields = [];
    isLoading = false;
    expandCollapseBtn = 'Show All Snap Shots';
    expandAll = false;
    expandCollapseBtnIcon = 'utility:add'
    async connectedCallback(){
        try{
            this.getOrgLimits();
            this.getForm();
        }catch(e){
            console.error('Error in Connected Callback=>',e)
        }

    }
    async getForm(){
        const form = await getForm({recordId : null,objectName : 'Limits__c',fieldSetName : 'LimitsEdit'});
        if(form){
            console.log('Form Details=>',JSON.stringify(form?.Fields));
            this.fields = form.Fields;
        }
    }
    async getOrgLimits(){
        try{
            const OrgLimits = await getOrgLimits();
            if(OrgLimits){
                OrgLimits.forEach(limit => limit.reachedThreshold = limit.Latest_Snap_Shot_Consumption__c > limit.Alert_Threshold__c);
                this.OrgLimits = OrgLimits;
                this.filteredOrgLimits = OrgLimits;
                console.log('Org Limits=>',OrgLimits);
            }
        }catch(e){
            console.error('Error in getOrgLimits=>',e);
        }
    }

    async createSnapShotOnDemand(){
        try{
            this.isLoading = true;
            const response = await createSnapShotOnDemand();
            if(response === 'Success'){
                console.log('Records Created');
                await this.getOrgLimits();
                this.template.querySelectorAll('c-org-limits-card').forEach(cmp => cmp.buildSnapShots());
            }else{
                console.error('Not Success in createSnapShotOnDemand=>',response);
            }
        }catch(e){
            console.error('Error in createSnapShotOnDemand=>',e);
        }finally{
            this.isLoading = false;
        }
        
    }

    handleKeyUp(event){
        try{
            console.log('Key=>',event.target.value);
            this.searchKey = event.target.value;
            if(this.searchKey?.trim()?.length == 0){
                this.filteredOrgLimits = [...this.OrgLimits];
                return;
            }
            this.filteredOrgLimits = this.OrgLimits?.filter(limit => limit.ExternalId__c?.toLowerCase()?.includes(this.searchKey?.toLowerCase()));

        }catch(e){
            console.error('Error in Handle Key Up=>',e);
        }
    }

    expandCollapse(){
        this.expandAll = this.expandAll ? false : true;
        this.expandCollapseBtn = this.expandAll ? `Hide All Snap Shots` : `Show All Snap Shots`;
        this.expandCollapseBtnIcon = this.expandAll ? `utility:dash` : `utility:add`;
        this.template.querySelectorAll('c-org-limits-card').forEach(cmp => cmp.expandCollapse(this.expandAll));
    }
}