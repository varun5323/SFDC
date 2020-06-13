({
	doInit : function(component, event, helper) {
        helper.doInit(component,event)  
	},
    
    selectFromHeaderStep : function(component, event, helper) {
        var currentStep = event.getSource().get("v.value");
        if(currentStep == '2'){
            var selrows = component.get('v.selectedRowList');
            if(selrows.length == 0){
                helper.showToast(component,event,"error","","Please Select atleast one record to Merge.");
                return;   
            }
        }
        component.set('v.currentStep',currentStep);
	},
    
    moveNext : function(component, event, helper) {
        var selrows = component.get('v.selectedRowList');
        if(selrows.length == 0){
            helper.showToast(component,event,"error","","Please Select atleast one record to Merge.");
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
    
    moveBack : function(component, event, helper) {
        var currentStep = component.get('v.currentStep');
        var intStep = (parseInt(currentStep))-1
        var incStep = intStep.toString();
        component.set('v.currentStep',incStep);
	},
    
    getSelectedRows : function(component, event, helper) {
        var selRows = event.getParam('selectedRows');
       	console.log('--Selected--' + JSON.stringify(selRows));
        component.set('v.selectedRowList',selRows);
        
    },
    finish : function(component, event, helper) {
        helper.finish(component,event);
    },
    
    handleQueueAction : function(component,event,helper){
        helper.handleQueueAction(component,event);
    }
})