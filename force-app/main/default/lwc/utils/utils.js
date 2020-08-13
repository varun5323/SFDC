export function showLog(value) {
    console.log('Function in util called' + value);
}

export function buildElement(elemType,parentElem,labelVal='',attributes='',labelType='buildLabel',breakOn=true){
    var datId = '[data-id="' + parentElem + '"]';
    var parentElement = this.template.querySelector(datId);
    var childElement = document.createElement(elemType);
    childElement.setAttribute(this.templateName,'');
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

export function buildLabel(){

}