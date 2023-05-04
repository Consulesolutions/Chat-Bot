/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https'],
/**
 * @param {https} https
 */
function(https) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext)
    {
    	console.log("pageInit scriptContext", scriptContext);
    	var htmlElem = document.getElementById('NS_MENU_ID0');
    	console.log("pageInit htmlElem", htmlElem);
    	
    	
//    	var a = document.getElementById('chatbot_initializer');
//    	if(a || a.length > 0)
//    	{
//    		return;
//    	}
    	
    	
    	addtlHtml = '<li class="ns-menuitem ns-submenu ns-header" role="menuitem">';
    	window.openAsPopup = openAsPopup;
    	addtlHtml += "<a id='chatbot_initializer' href='#' "
    	addtlHtml += 'onclick="';
    	addtlHtml += "openAsPopup('/app/site/hosting/scriptlet.nl?script=2501&deploy=1', 'Chatbot" + "', 450,525)";
//    	addtlHtml += openAsPopup+"('/app/site/hosting/scriptlet.nl?script=2501&deploy=1', 'Chatbot" + "', 450,525)";
    	addtlHtml += '"> CHATBOT </a>';
		
    	addtlHtml += '</li>'
    	htmlElem.innerHTML += addtlHtml;

    	var timer =null;
    	console.log("timer", timer);
    	if(!timer)
    	{
    		timer = setInterval(function(res){
//        		var response = jQuery.get('/app/site/hosting/scriptlet.nl?script=2501&deploy=1&getUnread=T', {getUnread:true})
        		var response = jQuery.post('/app/site/hosting/scriptlet.nl?script=2501&deploy=1&getUnread=T', {getUnread:true}).done(function( data ) {
        			console.log( "Data Loaded: " + data );
        			
        			commentPositions = data.indexOf('<!--');
        			data = data.substring(0, (commentPositions == -1) ? data.length : commentPositions);
//        			data = JSON.parse(requestUrl_responseJson);
        			
        			var chatbot_initializer = document.getElementById('chatbot_initializer');
        			
//            		var responseText = response.responseText
//            		console.log("responseText", responseText);
            		var response = data ? JSON.parse(data) : [];
            		if(response && response.length > 0)
            		{
            			chatbot_initializer.innerHTML = "CHATBOT" + "(" + response.length + ")"
            		}
            		else
            		{
            			chatbot_initializer.innerHTML = "CHATBOT";
            		}
        			
        		  });
        		
        	}, 3000)
        	
    	}
    	
    }
    
    function openAsPopup(url, title, w, h){
    	
		childWindow = window.open(url, title,
				"width=" + w + ",height=" + h + "toolbar=no," +
			    "scrollbars=no," +
			    "location=no," +
			    "statusbar=no,");
		
		childWindow.focus();
		childWindow.resizeTo(w, h);
		childWindow.moveTo(((screen.width - w) / 2), ((screen.height - h) / 2));
		
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    return {
        pageInit: pageInit,
        openAsPopup : openAsPopup
//        fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
//        saveRecord: saveRecord
    };
    
});
