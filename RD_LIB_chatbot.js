/**
 *@NApiVersion 2.x
 *@NModuleScope public
 */
define(['N/search', 'N/record', 'N/runtime', 'N/https', 'N/encode', 'N/error', 'N/format', 'N/log', 'N/task'],
    function (search, record, runtime, https, encode, error, format, log, task) {
	
	var TEMP_CHATBOT_EMP_ID = 38720;
	
	var CHATBOX_MSG_RECORD = {
			recordtype : "customrecord_rd_chatbox_msg",
			fields : {
				name : "name",
				author : "custrecord_rd_cm_author",
				recipient : "custrecord_rd_cm_recipient",
				message : "custrecord_rd_cm_message"
			}
	};
	function createMsg(msgObj, isChatbotResponse)
	{
		var msgRec = record.create({
			type : CHATBOX_MSG_RECORD.recordtype
		});
		
		msgRec.setValue({
			fieldId : CHATBOX_MSG_RECORD.fields.name,
			value : (new Date().getTime())
		})
		
		log.debug("createMsg msgObj", msgObj);
		log.debug("createMsg msgObj.author", msgObj.author);
		log.debug("createMsg msgObj.message", msgObj.message);
		log.debug("createMsg msgObj.recipient", msgObj.recipient);
		log.debug("createMsg typeof msgObj", typeof msgObj);
		
		msgRec.setValue({
//			fieldId : CHATBOX_MSG_RECORD.fields.author,
			fieldId :"custrecord_rd_cm_author",
			value : msgObj.author
		})
		msgRec.setValue({
//			fieldId : CHATBOX_MSG_RECORD.fields.recipient,
			fieldId : "custrecord_rd_cm_recipient",
			value : msgObj.recipient
		})
		msgRec.setValue({
//			fieldId : CHATBOX_MSG_RECORD.fields.message,
			fieldId : "custrecord_rd_cm_message",
			value : msgObj.message
		})
		
		log.debug("msgRec", msgRec)
		log.debug("msgRec.getValue(custrecord_rd_cm_message)", msgRec.getValue({fieldId : "custrecord_rd_cm_message"}))
		
		
		aLookup = search.lookupFields({
			type : "employee",
			id : msgObj.author,
			columns : ["entityid"]
		})
		rLookup = search.lookupFields({
			type : "employee",
			id : msgObj.recipient,
			columns : ["entityid"]
		})
		
		
		msgObj.authorText = aLookup.entityid
		msgObj.recipientText = rLookup.entityid
		
		var msgId = msgRec.save({
			ignoreMandatoryFields:true,
			allowSourcing:true
		})
		
		msgObj.msgId = msgId;
		log.debug("msgObj", msgObj)
		return msgObj;
	}
	
	function deleteAll()
	{
		window.nlapiSearchRecord(window.nlapiGetRecordType()).forEach(function(res){
			window.nlapiDeleteRecord(window.nlapiGetRecordType(), res.getId())
		})
	}
	
	function openChat(empId)
    {

		var TEMP_CHATBOT_EMP_ID = 38720;
		
		if(empId == -999)
		{
			empId = TEMP_CHATBOT_EMP_ID || 38720;
		}
		
    	jQuery('#chat-container')[0].innerHTML = window.nlapiRequestURL("https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&empId=" + empId, JSON.stringify({empId : empId}), null, null, 'GET').body;
    	
    	console.log("RD_LIB_chatbot.js empId", empId);
		
		var elem = document.getElementById("chat-messages");
		console.log("elem",elem)
		elem.scrollTop = elem.scrollHeight;
    }

    return {
    	createMsg : createMsg,
    	openChat : openChat,
    	TEMP_CHATBOT_EMP_ID : TEMP_CHATBOT_EMP_ID,
    	CHATBOX_MSG_RECORD : CHATBOX_MSG_RECORD
    };
});

