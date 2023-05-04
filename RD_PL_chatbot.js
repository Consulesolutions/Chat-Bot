/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/file'],
/**
 * @param {serverWidget} serverWidget
 */
function(serverWidget, file) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) {
    	
    	/*var fileObj = file.load({
    		id:'SuiteScripts/Rodmar/Chatbot/RD_chatbot_ih.html'
    	});
    	var fileObj_content = fileObj.getContents();
    	log.debug("fileObj_content", fileObj_content);
    	
    	var portlet = params.portlet;
        portlet.title = 'Simple Form Portlet';
        var inlineHtmlField = portlet.addField({
    		type : "inlinehtml",
    		id : "custpage_chatboxfield",
    		label : "chatboxfield"
    	})
    	inlineHtmlField.defaultValue = fileObj_content;*/
    	
    	var portlet = params.portlet;
        portlet.title = 'Simple Form Portlet';
		
        var inlineHtmlField = portlet.addField({
    		type : "inlinehtml",
    		id : "custpage_chatboxfield",
    		label : "chatboxfield"
    	})
    	
    	var slLink = "https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1";
        
        
    	inlineHtmlField.defaultValue = "<iframe height='590px' width='100%' src=" + slLink + "></iframe>";
        
        
        
    }

    return {
        render: render
    };
    
});
