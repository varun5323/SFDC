({
	doInit : function(component,event) {
		var colsList=[];
        var queuecolsList = [];
        var actions = [
            { label: 'Show details', name: 'show_details' },
            { label: 'Delete', name: 'delete' }
        ];
        var queueactions = [
            
            { label: 'Delete from Merge', name: 'delete' }
        ];
        var action = component.get('c.getColumns');
        action.setParams({
            'objName' : component.get('v.objectName'),
            'sobj' : component.get('v.recordId')
        });
        action.setCallback(this,function(a){
            if(a.getState() === "SUCCESS"){
                var custCols = a.getReturnValue(); //Return Value
                var finalCols = custCols.cols; //Duplicate Table columns
                var recData = custCols.mw.dupRecords;//Duplicate Records
                var queuedata = custCols.mrList; //Queued Records
                console.log('queuedata--' + JSON.stringify(queuedata));
                var sobjMap = custCols.sObjMap;
                component.set('v.InitWrapperData',custCols);
                colsList.push({'label':'Record Id','fieldName':'viewlink','type':'url','typeAttributes': { 'target': '_blank','label':{'fieldName':'Id'}}});
                queuecolsList.push({'label': 'Merge Id', 'fieldName': 'MergeLink', 'type': 'url','typeAttributes':{'label':{'fieldName':'MergeId' },'target':'_blank'}});
                queuecolsList.push({'label': 'Merging Record Id', 'fieldName': 'recordLink', 'type': 'url','typeAttributes':{'label':{'fieldName':'Merging_Record__c' },'target':'_blank'}});
                
                finalCols.forEach(function(col){
                    var cols={};
                    cols.label = col.Label__c;
                    cols.fieldName = col.Field_API_Name__c;
                    cols.type = col.Field_Type__c;
                    colsList.push(cols); 
                    queuecolsList.push(cols);
                });
                console.log('CheckPoint 1');
                colsList.push({'type':'action','typeAttributes':{'rowActions':actions}});
                component.set('v.columns',colsList);
                
				console.log('CheckPoint 2');                
                recData.forEach(function(rec){
                    rec.viewlink = '/'+rec.Id
                });
                component.set('v.data',recData);
                console.log('CheckPoint 3');
                //Queue Table Data and Columns
                
                queuecolsList.push({'type':'action','typeAttributes':{'rowActions':queueactions}});
                component.set('v.queuecolumns',queuecolsList);
                console.log('CheckPoint 4');
                
                queuedata.forEach(function(qd){
                    var rec = sobjMap[qd.Merging_Record__c];
                    if(rec != undefined){
                        qd.recordLink = '/'+qd.Merging_Record__c;
                        qd.MergeId = qd.Id;
                        qd.MergeLink = '/'+qd.Id;
                        
                        //var rec = sobjMap[qd.Merging_Record__c];
                        var fields = Object.keys(rec);
                        fields.forEach(function(f){
                            qd[f] = rec[f];
                        })
                    }
                	
                                
                })
                console.log('CheckPoint 5');
                component.set('v.queuedata',custCols.mrList);
                console.log('---queuedata--' + JSON.stringify(component.get('v.queuedata')));
                $A.get('e.force:refreshView').fire();
                    
            }else{
               console.log('--ERROR---'); 
            }
        });
        $A.enqueueAction(action);
	},
    
    showToast : function(component,event,type,title,msg){
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type" : type,
            "title": title,
            "message": msg
        });
        toastEvent.fire();
        
    },
    
    finish : function(component,event){
        var selrows = component.get('v.selectedRowList');
        var masterId = component.get('v.recordId');
        var objName = component.get('v.objectName');
        var childIds = [];
        for(var i=0;i<selrows.length;i++){
            childIds.push(selrows[i].Id);
        }
        var action = component.get('c.insertMerges');
        action.setParams({
            "masterId" : masterId,
            "childIds" : childIds,
            "objName" : objName
        });
        action.setCallback(this,function(a){
            if(a.getState() === "SUCCESS"){
                
                console.log('Success--' + JSON.stringify(a.getReturnValue()));
                var msg = "Records are Queued for merging";
                if(a.getReturnValue() == 'Success'){
                    this.showToast(component,event,"success","",msg);
                    this.reload();
                }	
                else{
                    this.showToast(component,event,"error","","Failed to Queue records for merge--"+a.getReturnValue());
                    this.screenOne(component,event)
                }
                
            }else{
                this.showToast(component,event,"error",a.getState(),"Failed to Queue records for merge--"+a.getReturnValue());
            }
        });
        $A.enqueueAction(action);
        console.log('---Finish--' + JSON.stringify(component.get('v.selectedRowList')));
    },
    
    handleQueueAction : function(component,event){
        var action = event.getParam('action');
        var row = event.getParam('row');
        switch (action.name){
            case 'delete':
                console.log('--ROW--' + JSON.stringify(row));
                var delaction = component.get('c.deleteMerges');
                delaction.setParams({
                    "mergeId" : row.MergeId
                });
                delaction.setCallback(this,function(a){
                    if(a.getState() === "SUCCESS"){
                        this.reload(component,event);   
                    }else{
                        console.log('--ERROR DELETING--')
                    }
                });
                $A.enqueueAction(delaction);      
        }
    },
    reload : function(component,event){
        location.reload();
    },
    
    screenOne : function(component,event){
        component.set('v.currentStep','1');
    },
    
    moveNext : function(component,event){
        var selrows = component.get('v.selectedRowList');
        if(selrows.length == 0){
            this.showToast(component,event,"error","","Please Select atleast one record to Merge.");
            return;   
        }
        var currentStep = component.get('v.currentStep');
        if(currentStep == '1'){
            var selectedRows = component.get('v.selectedRowList');
        }
        var intStep = (parseInt(currentStep))+1
        var incStep = intStep.toString();
        component.set('v.currentStep',incStep);
    },
    
    moveBack : function(component,event){
        
    }
})