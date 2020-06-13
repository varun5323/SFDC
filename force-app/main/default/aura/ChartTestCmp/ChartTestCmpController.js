({
    afterScriptsLoaded : function(component, event, helper) {
        console.log('Loaded Scripts');
        component.set("v.ready", true);
        helper.createChart(component);
    }
})