/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/file', './RD_LIB_chatbot.js'],
/**
 * @param {serverWidget} serverWidget
 */
function(serverWidget, file, lib_chatbot) {
   
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
    	
    	var fileObj = file.load({
    		id:'SuiteScripts/Rodmar/Chatbot/RD_chatbot_ih.html'
    	});
    	var fileObj_content = fileObj.getContents();
    	log.debug("fileObj_content", fileObj_content);
    	
    	
    	var listOfContactsHtml = get_listOfContactsHtml();
    	fileObj_content = fileObj_content.replace('<custom_chatbot_tag id="listofcontacts"></custom_chatbot_tag>', listOfContactsHtml);
    	
    	
//    	params.portlet.title = 'My Portlet';
//        var content = '<td><span><b>Hello!!!</b></span></td>';
//        params.portlet.html = content;
        
        params.portlet.title = 'My Portlet';
        //var content = fileObj_content;
        var content = "<script> " + submitMsg + "</script>" + fileObj_content;
        
//        params.portlet.clientScriptModulePath = '/SuiteScripts/Rodmar/Chatbot/RD_CS_chatbot.js'
        
        params.portlet.html = content;
    }
    
    function get_listOfContactsHtml()
    {
    	var listOfContactsHtml = "";

    	listOfContactsHtml += "<div><script>" +
    			"function openChat(empId){alert('via scripttag function, empid : ' + empId);}" +
    			"</script></div>";
    	
    	listOfContactsHtml += "<div onclick='" + openChat + "openChat(-999)'>Chatbot</div>";
    	listOfContactsHtml += "<div onclick='" + openChat + "openChat(5)'>P DAWG</div>";
    	listOfContactsHtml += "<div onclick='" + openChat + "openChat(6)'>Franz Reynolds</div>";
    	listOfContactsHtml += "<div onclick='" + openChat + "openChat(7)'>Kaye</div>";
    	listOfContactsHtml += "<div onclick='alert(" + '"via inline code"' + ")'" + ">Kaye</div>";
    	
    	return listOfContactsHtml;
    }
    
    function openChat(empId)
    {
    	jQuery('#chat-container')[0].innerHTML = window.nlapiRequestURL("https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&empId=" + empId, JSON.stringify({empId : empId}), null, null, 'GET').body;
    }
    
    function submitMsg()
	{
		try
		{
			var msg = $(".chat-input")[0].value;
			console.log("msg", msg);
			
			var slUrl = "https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&message=" + msg + "&recipient=" + 38719 + "&author=" + 38719;
			
			var requestUrl_response = window.nlapiRequestURL(slUrl, JSON.stringify({message : msg, recipient : 38719, author : 38719}), null, null, 'POST');
			
			console.log("requestUrl_response", requestUrl_response);
			
			
			/* var resp = $.post({
				url : slUrl,
				type : "POST",
				//data : jQuery.param({msg : msg, recipient : 38719, sender : 38719}),
				data : {msg : msg, recipient : 38719, sender : 38719},
				//contentType: "application/json;charset=utf8",
				dataType: "json",
				success: function(data) {
				      console.log("success data", data)
				},
			    error: function(data) {
			    	console.log("error data", data)
			    },
				
				
			});
	    	console.log(" resp", resp) */
	    	
	    	
//			var requestUrl_responseJson = JSON.parse(requestUrl_response);
//	    	
//			addValidatedChat(requestUrl_responseJson);
	    	
			addValidatedChat(requestUrl_response);
			
		}
		catch(e)
		{
			console.log("ERROR in function submitMsg", e)
		}
	}
    
    function addValidatedChat(chatObj)
	{
		try
		{
			var chatHtml = '<div class="message-box-holder"><div class="message-box">' + chatObj.message + '</div></div>'
			$(".chat-messages")[0].innerHTML += chatHtml;
		}
		catch(e)
		{
			console.log("ERROR in fcuntion addValidatedChat", e);
		}
	}

    return {
        render: render
    };
    
});
