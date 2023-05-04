/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/ui/serverWidget', 'N/file', './RD_LIB_chatbot.js'],
/**
 * @param {serverWidget} serverWidget
 */
function(record, search, runtime, serverWidget, file, lib_chatbot) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if(context.request.method == "GET")
    	{
    		if(context.request.parameters && context.request.parameters.getUnread)
    		{
    			var dialogHtml = "";
    			var currentUserInternalId = runtime.getCurrentUser().id;
    			var customrecord_rd_chatbox_msgSearchObj = search.create({
       			   type: "customrecord_rd_chatbox_msg",
       			   filters:
       			   [
 						["custrecord_rd_cm_recipient", "anyof", currentUserInternalId],
 						"AND",
 						["custrecord_rd_cm_received", "anyof", false],
       			   ],
       			   columns:
       			   [
       			      search.createColumn({
       			         name: "name",
       			         sort: search.Sort.ASC,
       			         label: "Name"
       			      }),
       			      search.createColumn({name: "custrecord_rd_cm_author", label: "Author"}),
       			      search.createColumn({name: "custrecord_rd_cm_recipient", label: "Recipient"}),
       			      search.createColumn({
       			         name: "created",
       			         sort: search.Sort.DESC,
       			         label: "Date Created"
       			      }),
       			      search.createColumn({name: "custrecord_rd_cm_message", label: "Message"}),
       			      search.createColumn({name: "internalid", label: "Internal ID"})
       			   ]
       			});
    			
    			
    			customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
       			   // .run().each has a limit of 4,000 results
       				var chatboxUser_author = result.getValue({name: "custrecord_rd_cm_author", label: "Author"});
       				var chatboxUser_authortext = result.getText({name: "custrecord_rd_cm_author", label: "Author"});
       				var chatboxUser_recipient = result.getValue({name: "custrecord_rd_cm_recipient", label: "Recipient"});
       				var chatboxUser_recipienttext = result.getText({name: "custrecord_rd_cm_recipient", label: "Recipient"});
       				var chatboxMsg_last = result.getValue({name: "custrecord_rd_cm_message", label: "Message"});

       				var dialogHtml_temp = ""
       				if(chatboxUser_author != currentUserInternalId)
       				{
       					dialogHtml_temp += '<div class="message-box-holder">' +
 				        '<div class="message-sender">' +
 				        chatboxUser_recipienttext +
 				        '</div>' +
 				        '<div class="message-box message-partner">' +
// 				        '<p>' +
 				        chatboxMsg_last +
// 				        '</p>' +
 				        '</div>' +
 				        '</div>';
       					
       					log.debug("chatboxUser_author != currentUserInternalId dialogHtml", dialogHtml_temp)
       				}
       				else
       				{

       					dialogHtml_temp += '<div class="message-box-holder">' +
       					
       		        	'<div class="message-box">' +
       		        	chatboxMsg_last +
       			        '</div>' +
       			        '</div>';
       					
       					log.debug("chatboxUser_author == currentUserInternalId dialogHtml", dialogHtml_temp)
       				}
       				
           			dialogHtml += dialogHtml_temp;
       			   return true;
       			});
    			
    			return context.response.write({
    				output : dialogHtml
    			})
    		}
    		else if(context.request.parameters && context.request.parameters.empId)
    		{
    			var currentUserInternalId = runtime.getCurrentUser().id;
    			
    			if(context.request.parameters.empId == -999)
    			{
        			context.request.parameters.empId = 38720;
    			}
    			
    			var empLookup = search.lookupFields({
    				type : "employee",
    				id : context.request.parameters.empId,
    				columns : ["entityid", "custentity_rd_cm_chatboximage"]
    			});
    			
    			
    			
    			//default
    			var imgTag = '<a target="_blank" href="https://www.google.com"><img src="' + '/core/media/media.nl?id=54831&c=TSTDRV1469253&h=KClF07ogdz5hqq2P1IjEEVDlf2K0az-aBsqxcW81gdWGDBxH' + '" /></a>';
    			if(empLookup["custentity_rd_cm_chatboximage"] && empLookup["custentity_rd_cm_chatboximage"][0] && empLookup["custentity_rd_cm_chatboximage"][0].value)
    			{
    				log.debug("empLookup", empLookup)
    				try
    				{
    					var chatboxUserFileObj = file.load({
            				id : empLookup["custentity_rd_cm_chatboximage"][0].value
            			});
            			log.debug("chatboxUserFileObj", chatboxUserFileObj);
            			var chatboxUserFileObj_url = chatboxUserFileObj.url;
            			log.debug("chatboxUserFileObj_url", chatboxUserFileObj_url);
        				
            			if(chatboxUserFileObj_url)
            			{
            				imgTag = '<a target="_blank" href="https://www.google.com"><img alt=' + empLookup["custentity_rd_cm_chatboximage"][0].text + ' ' + 'src="' + chatboxUserFileObj_url + '" /></a>';
            				//imgTag = '<a alt=' + empLookup["custentity_rd_cm_chatboximage"][0].text + 'target="_blank" href="' + chatboxUserFileObj_url + '" /></a>';
            			}
    				}
    				catch(e)
    				{
    					log.error("ERROR in resolving avatar", e)
    				}
    			}
    			
    			//begin display display headers
    			var dialogHtml = "";
    			dialogHtml += '<div style="height:50px"></div>';
    			dialogHtml += "<div id='chatbox-holder'>" +
        		'<div class="chatbox">' +
        		'<div class="chatbox-top"' + "rd_cm_empid=" + context.request.parameters.empId + '>' +
        		'<div class="chatbox-avatar">' +
        		imgTag +
        		'</div>' +
        		'<div class="chat-partner-name">' +
        		'<span class="status online"></span>' +
        		'<a target="_blank" href="hhttps://www.google.com">' + empLookup.entityid + '</a>' +
        		'</div>' +
        		'<div class="chatbox-icons">' +
        		'<a href="javascript:void(0);"><i class="fa fa-minus"></i></a>' +
        		'<a href="javascript:void(0);"><i class="fa fa-close" onclick="' + "jQuery('#chat-container')[0].innerHTML=''" + '">X</i></a>' +
        		'</div>' +
        		'</div>' +
        		"<div id='chat-messages'>";
        		
    			
    			var customrecord_rd_chatbox_msgSearchObj = search.create({
      			   type: "customrecord_rd_chatbox_msg",
      			   filters:
      			   [
      			    	[["custrecord_rd_cm_author", "anyof", currentUserInternalId],
						"AND",
						["custrecord_rd_cm_recipient", "anyof", context.request.parameters.empId]],
						"OR",
						[["custrecord_rd_cm_author", "anyof", context.request.parameters.empId],
						"AND",
						["custrecord_rd_cm_recipient", "anyof", currentUserInternalId]],
      			   ],
      			   columns:
      			   [
      			      search.createColumn({
      			         name: "name",
      			         sort: search.Sort.ASC,
      			         label: "Name"
      			      }),
      			      search.createColumn({name: "custrecord_rd_cm_author", label: "Author"}),
      			      search.createColumn({name: "custrecord_rd_cm_recipient", label: "Recipient"}),
      			      search.createColumn({
      			         name: "created",
      			         sort: search.Sort.DESC,
      			         label: "Date Created"
      			      }),
      			      search.createColumn({name: "custrecord_rd_cm_message", label: "Message"}),
      			      search.createColumn({name: "internalid", label: "Internal ID"}),
      			      search.createColumn({name: "custrecord_rd_cm_received", label: "Received"})
      			   ]
      			});
      			var searchResultCount = customrecord_rd_chatbox_msgSearchObj.runPaged().count;
      			log.debug("customrecord_rd_chatbox_msgSearchObj result count",searchResultCount);
      			
      			customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
      			   // .run().each has a limit of 4,000 results
      				var chatboxUser_author = result.getValue({name: "custrecord_rd_cm_author", label: "Author"});
      				var chatboxUser_authortext = result.getText({name: "custrecord_rd_cm_author", label: "Author"});
      				var chatboxUser_recipient = result.getValue({name: "custrecord_rd_cm_recipient", label: "Recipient"});
      				var chatboxUser_recipienttext = result.getText({name: "custrecord_rd_cm_recipient", label: "Recipient"});
      				var chatboxMsg_last = result.getValue({name: "custrecord_rd_cm_message", label: "Message"});
      				var chatboxMsg_received = result.getValue({name: "custrecord_rd_cm_received", label: "Message"});

      				if(chatboxMsg_received && chatboxMsg_received != 'F')
      				{
      					
      				}
      				else
      				{
      					log.debug("ATTEMPT TO MARK msg as read result", result);
      					var submittedRecId = record.submitFields({
      						type : result.recordType,
      						id : result.id,
      						values : {custrecord_rd_cm_received:true}
      					});
      					
      					log.debug("ATTEMPT TO MARK msg as read - SUCCESS", submittedRecId);
      				}
      				
      				var dialogHtml_temp = ""
      				if(chatboxUser_author != currentUserInternalId)
      				{
      					dialogHtml_temp += '<div class="message-box-holder">' +
				        '<div class="message-sender">' +
				        chatboxUser_recipienttext +
				        '</div>' +
				        '<div class="message-box message-partner">' +
//				        '<p>' +
				        chatboxMsg_last +
//				        '</p>' +
				        '</div>' +
				        '</div>';
      					
      					log.debug("chatboxUser_author != currentUserInternalId dialogHtml", dialogHtml_temp)
      				}
      				else
      				{

      					dialogHtml_temp += '<div class="message-box-holder">' +
      					
      		        	'<div class="message-box">' +
      		        	chatboxMsg_last +
      			        '</div>' +
      			        '</div>';
      					
      					log.debug("chatboxUser_author == currentUserInternalId dialogHtml", dialogHtml_temp)
      				}
      				
          			dialogHtml += dialogHtml_temp;
      			   return true;
      			});
      			
      			
      			//fixed msg or chatbot tips
    			//insert actual msgs after this
    			if(context.request.parameters.empId == -999 || context.request.parameters.empId == 38720)
    			{
        			dialogHtml += '<div class="message-box-holder">' +
    		        '<div class="message-sender">' +
    		        empLookup.entityid +
    		        '</div>' +
    		        '<div class="message-box message-partner">' +
    		        getFixedChatbotMsgs(context.request.parameters.empId) +
    		        '</div>' +
    		        '</div>';
    			}
      			
      			
      			
      			dialogHtml += '</div>' +
        		'<div class="chat-input-holder">' +
        		'<textarea class="chat-input"></textarea>' +
        		//'<input type="submit" value="Send" class="message-send" />' +
        		'<button type="button" class="message-send" onclick="submitMsg()">Send</button>' +
        		'</div>' +
        		'</div>' +
        		'</div>' +
        		'';
    			//end display headers
    			
    			
    			
    			return context.response.write({
    				output : dialogHtml
    			})
    		}
    		else
    		{
    			var fileObj = file.load({
            		id:'SuiteScripts/Rodmar/Chatbot/RD_chatbot_ih.html'
            	});
            	var fileObj_content = fileObj.getContents();
            	log.debug("fileObj_content", fileObj_content);
            	
            	var listOfContactsHtml = get_listOfContactsHtml();
            	
            	fileObj_content = fileObj_content.replace('<custom_chatbot_tag id="listofcontacts"></custom_chatbot_tag>', listOfContactsHtml);
            	
            	var chatboxForm = serverWidget.createForm({
            		title: "RD chatbox",
            		hideNavBar: true
            	});
            	
            	var inlineHtmlField = chatboxForm.addField({
            		type : "inlinehtml",
            		id : "custpage_chatboxfield",
            		label : "chatboxfield"
            	})
            	inlineHtmlField.defaultValue = fileObj_content;
//            	inlineHtmlField.defaultValue = "<script> " + submitMsg + "</script>" + fileObj_content;
            	

            	chatboxForm.clientScriptModulePath = '/SuiteScripts/Rodmar/Chatbot/RD_CS_chatbot.js'
            	log.debug("writepage!")
            	context.response.writePage(chatboxForm);
    		}
    	}
    	else if(context.request.method == "POST")
    	{
    		
    		
    		log.debug("context.request.parameters", context.request.parameters)
    		
    		
    		if(context.request.parameters && context.request.parameters.getUnread)
    		{
    			var msgList = [];
    			var dialogHtml = "";
    			var currentUserInternalId = runtime.getCurrentUser().id;
    			var customrecord_rd_chatbox_msgSearchObj = search.create({
       			   type: "customrecord_rd_chatbox_msg",
       			   filters:
       			   [
 						["custrecord_rd_cm_recipient", "anyof", currentUserInternalId],
 						"AND",
 						["custrecord_rd_cm_received","is","F"],
       			   ],
       			   columns:
       			   [
       			      search.createColumn({
       			         name: "name",
       			         sort: search.Sort.ASC,
       			         label: "Name"
       			      }),
       			      search.createColumn({name: "custrecord_rd_cm_author", label: "Author"}),
       			      search.createColumn({name: "custrecord_rd_cm_recipient", label: "Recipient"}),
       			      search.createColumn({
       			         name: "created",
       			         sort: search.Sort.DESC,
       			         label: "Date Created"
       			      }),
       			      search.createColumn({name: "custrecord_rd_cm_message", label: "Message"}),
       			      search.createColumn({name: "internalid", label: "Internal ID"}),
       			      search.createColumn({
         		         name: "custrecord_rd_cm_received",
        		         label: "Received"
        		      })
       			   ]
       			});
    			
    			
    			customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
       			   // .run().each has a limit of 4,000 results
       				var chatboxUser_author = result.getValue({name: "custrecord_rd_cm_author", label: "Author"});
       				var chatboxUser_authortext = result.getText({name: "custrecord_rd_cm_author", label: "Author"});
       				var chatboxUser_recipient = result.getValue({name: "custrecord_rd_cm_recipient", label: "Recipient"});
       				var chatboxUser_recipienttext = result.getText({name: "custrecord_rd_cm_recipient", label: "Recipient"});
       				var chatboxMsg_last = result.getValue({name: "custrecord_rd_cm_message", label: "Message"});
       				var chatboxMsg_received = result.getValue({
         		         name: "custrecord_rd_cm_received",
        		         label: "Received"
        		      });

       				var dialogHtml_temp = ""
       				if(chatboxUser_author != currentUserInternalId)
       				{
       					dialogHtml_temp += '<div class="message-box-holder">' +
 				        '<div class="message-sender">' +
 				        chatboxUser_recipienttext +
 				        '</div>' +
 				        '<div class="message-box message-partner">';
       					
       					log.debug("chatboxMsg_received xxx", chatboxMsg_received)
       					
 				        if(chatboxMsg_received && chatboxMsg_received != 'F')
 				        {
 	 				        dialogHtml_temp += '<p>' +
 	 				        chatboxMsg_last +
 	 				        '</p>' +
 	 				        '</div>' +
 	 				        '</div>';
 				        }
 				        else
 				        {
 				        	dialogHtml_temp += '<p class="unreadmsg">' +
 	 				        chatboxMsg_last +
 	 				        '</p>' +
 	 				        '</div>' +
 	 				        '</div>';
 				        }
 				        
       					log.debug("chatboxUser_author != currentUserInternalId dialogHtml", dialogHtml_temp)
       				}
       				else
       				{

       					dialogHtml_temp += '<div class="message-box-holder">' +
       					
       		        	'<div class="message-box">' +
       		        	chatboxMsg_last +
       			        '</div>' +
       			        '</div>';
       					
       					log.debug("chatboxUser_author == currentUserInternalId dialogHtml", dialogHtml_temp)
       				}
       				
           			dialogHtml += dialogHtml_temp;
           			
           			msgList.push(dialogHtml_temp);
       			   return true;
       			});
    			
//    			return context.response.write({
//    				output : dialogHtml
//    			})
    			return context.response.write({
    				output : JSON.stringify(msgList)
    			})
    		}
    		else
    		{
    			log.debug("context.request", context.request);
        		var inputRaw = context.request.body;
        		
        		var inputJson = JSON.parse(inputRaw);
        		log.debug("inputJson", inputJson);
        		
        		
        		
        		var createMsg_result = lib_chatbot.createMsg(inputJson);
        		
        		//CHATBOT
        		
        		
        		//test
        		
        		
        		if(inputJson.recipient == -999 || inputJson.recipient == lib_chatbot.TEMP_CHATBOT_EMP_ID)
        		{

            		var chatBotResponseMsg_result = createChatbotResponse(createMsg_result);
//            		var tempRecipient = chatBotResponseMsg_result.author;
//            		var tempAuthor = chatBotResponseMsg_result.recipient;
//            		chatBotResponseMsg_result.author = tempAuthor;
//            		chatBotResponseMsg_result.recipient = tempRecipient;
            		if(chatBotResponseMsg_result)
            		{
            			var createMsg_result_response = lib_chatbot.createMsg(chatBotResponseMsg_result, true);
            			context.response.write({
                			output : JSON.stringify([createMsg_result, createMsg_result_response])
                		})
            		}
            		else
            		{
            			context.response.write({
                			output : JSON.stringify([createMsg_result])
                		})
            		}
        		}
        		else
        		{
        			context.response.write({
            			output : JSON.stringify([createMsg_result])
            		})
        		}
    		}
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    	}
    	
    	
    }
    
    //move to library
    function getFixedChatbotMsgs(empId)
    {
    	//todo can be resolved from custom record
    	var dialogHtml = "";
    	try
    	{
    		dialogHtml += "";
    		dialogHtml += "<p>" +
    				"You may use the following commands: <br/>" +
    				"<ul>" +
    				"<li>" +
    				"<b>CREATE SALESORDER:</b>" + 
    				"<br/><i>CREATE &lt;SPACE&gt; SALESORDER</i>" +
    				"</li>" +
    				"<li>" +
    				"<b>CREATE SALESORDER FOR A CUSTOMER:</b>" + 
    				"<br/><i>CREATE &lt;SPACE&gt; SALESORDER FOR &lt;CUSTOMER_NAME&gt;</i>" +
    				"</li>" +
    				"</ul>" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"" +
    				"</p>";
    	}
    	catch(e)
    	{
    		log.error("ERROR in function fixedChatbotMsgs", e)
    	}
    	
    	log.debug("getFixedChatbotMsgs dialogHtml", dialogHtml);
    	return dialogHtml
    }
    
    function createChatbotResponse(msgObj)
    {
    	var chatbotResponse = analyzeRequest(msgObj);
    	log.debug("chatbotResponse", chatbotResponse);
    	if(chatbotResponse)
    	{
    		return {message:chatbotResponse, author:msgObj.recipient, recipient : msgObj.author, recipientText : msgObj.authorText, authorText:msgObj.recipientText}
    	}
    }
    
    function analyzeRequest(msgObj)
    {
    	var rawMsg = msgObj.message;
    	
    	
    	var words_array = rawMsg.split(" ");
		var finalResp = "";
		var tempResponse = "";
    	
    	
    	var words = rawMsg.split(" ");
    	

		var chatbotResp_raw = "";
    	if(words.length == 1)
    	{
    		var searchObj = search.create({
    			type : "customrecord_rd_chatbox_phrase", //TODO
    			filters : [
    			           ["custrecord_rd_chatbox_phrase_kw1.name", "is", words[0]],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw2.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw3.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw4.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw5.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw6.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw7.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw8.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw9.name", "isempty", ""],
    			           "AND",
    			           ["custrecord_rd_chatbox_phrase_kw10.name", "isempty", ""],
    			           ],
    			columns : ["custrecord_rd_chatbox_phrase_qr"]
    		});
    		searchObj.run().each(function(result){
 			   // .run().each has a limit of 4,000 results
    			chatbotResp_raw = result.getValue({
    				name: "custrecord_rd_chatbox_phrase_qr"
    			});
 			   return false;
 			});
//    		searchObj.title = "ROD1"
//    		var srId = searchObj.save();
//    		log.debug("srId", srId);
    		
    		
//    		var tempWord = chatbotResp_raw;
//    		var employeeIndicator = chatbotResp_raw.indexOf("{{employee.")
//    		if(employeeIndicator > -1)
//    		{
//    			tempWord = tempWord
//    		}
    		
    		if(chatbotResp_raw.length == 0)
    		{
    			return "Im sorry. I do not understand the message.";
    		}
    		log.debug("chatbotResp_raw", chatbotResp_raw);
    		chatbotResp_raw_arr = chatbotResp_raw.split(" ");
    		for(var a = 0 ; a < chatbotResp_raw_arr.length ; a++)
    		{
    		    if(chatbotResp_raw_arr[a].indexOf("{{") == -1)
    		    {
    		        tempResponse += chatbotResp_raw_arr[a] + " ";
    		        finalResp += chatbotResp_raw_arr[a] + " ";
    		    }
    		    else
    		    {
		        	log.debug("A", 0)
    		        if(chatbotResp_raw_arr[a].indexOf(".") == -1)
    		        {
    		        	log.debug("A", 1)
    		        }
    		        else
    		        {
    		        	log.debug("A", 2)
    		        	var word = chatbotResp_raw_arr[a];
    		        	log.debug("word", word)
    		            var tempword1 = word.substring(0+2,word.indexOf("."))
    		            var tempword2 = word.substring(word.indexOf(".")+1, word.length-2);
    		            log.debug("tempword1", tempword1)
    		            log.debug("tempword2", tempword2)
    		            if(tempword1 == "employee")
    		            {
    		                var empRec = record.load({type : "employee", id : runtime.getCurrentUser().id});
    		                res = empRec.getValue({fieldId : tempword2});

    		                
    		                finalResp += res + " ";
    		            }
    		        }
    		    }
    		}
    		
    		
    	}
    	else if(words.length >= 2)
    	{
//    		var words = ["create", "salesorder", "for"];
    		//filter fillup
    		var filters = [];
    		var filter1 = [];
    		var maxKeywordCount = 10;
    		for(var a = 0 ; a < words.length-1 || maxKeywordCount > a; a++)
    		{
    			try
    			{
    				if(a < words.length)
    				{
    					if(a != 0)
        				{
        					filter1.push("AND")
        				}
        				if(words[a])
            			{
        					if(words[a].indexOf('@@') == -1)
        					{
        						filter1.push([["custrecord_rd_chatbox_phrase_kw" + (a+1) + ".name", "is", words[a]]]);        						
        					}
        					else
        					{
        						filter1.push([["custrecord_rd_chatbox_phrase_kw" + (a+1) + ".name", "isempty", ""]]);   
        					}
            			}
        				else
        				{
        					filter1.pop();
        				}
    				}
    				else
    				{
    					//add 1 time
    					if(filters.length == 0)
    					{
    						filters.push(filter1);
    					}
    				}
    				
    				if(!(a < words.length))
    				{
    					if(a != 0)
        				{
        					filters.push("AND")
        				}
    					filters.push(["custrecord_rd_chatbox_phrase_kw" + (a+1) + ".name", "isempty", ""]);
    				}
    				
    				
    			}
    			catch(e)
    			{
    				break;
    			}
    		}
//    		filters = [
//	           [["custrecord_rd_chatbox_phrase_kw1.name", "is", words[0]],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw2.name", "is", words[1]]],
//	           "AND",
//	           [
//	           ["custrecord_rd_chatbox_phrase_kw3.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw4.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw5.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw6.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw7.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw8.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw9.name", "isempty", ""],
//	           "AND",
//	           ["custrecord_rd_chatbox_phrase_kw10.name", "isempty", ""],
//	           ],
//	           ]
    		
    		
    		log.debug("filters", filters);
    		
    		var searchObj = search.create({
    			type : "customrecord_rd_chatbox_phrase", //TODO
    			filters : filters,
    			columns : ["custrecord_rd_chatbox_phrase_qr"]
    		});
    		searchObj.run().each(function(result){
 			   // .run().each has a limit of 4,000 results
    			chatbotResp_raw = result.getValue({
    				name: "custrecord_rd_chatbox_phrase_qr"
    			});
 			   return false;
 			});
    		
    		
//    		var tempWord = chatbotResp_raw;
//    		var employeeIndicator = chatbotResp_raw.indexOf("{{employee.")
//    		if(employeeIndicator > -1)
//    		{
//    			tempWord = tempWord
//    		}
    		
    		log.debug("chatbotResp_raw", chatbotResp_raw);
    		
    		if(chatbotResp_raw && chatbotResp_raw.length > 2)
    		{
    			
    			//if it starts with @@ it means its a special command
    			if(chatbotResp_raw[0] == "@" && chatbotResp_raw[1] == "@")
    			{

        			var commandResp = "";
    				switch(chatbotResp_raw)
    				{
    					case "@@createlead@@":
    					{
    						log.debug("create lead")
    						
    						commandResp = "<a target='_blank' href='/app/common/entity/custjob.nl?stage=lead&whence='>CREATE LEAD(NEW TAB)</a>";

    			        	commandResp += "<br/>";
    			        	commandResp += "<br/>";
    						
    			        	var hrefValue = "<a href='#' ";
    			        	hrefValue += 'onclick="';
    			    		hrefValue += "openAsPopup('/app/common/entity/custjob.nl?stage=lead&whence=', 'Popup_lead" + "', 450,525)";
    			        	hrefValue += '"> CREATE LEAD(POPUP CENTERED) </a>';
    						
    			        	commandResp += hrefValue;
    			        	return commandResp;
    						break;
    					}
    					case "@@viewlead@@":
    					{
    						log.debug("view lead")
    						
    						commandResp = "<a target='_blank' href='/app/common/entity/custjob.nl?id=36331'>VIEW LEAD(NEW TAB)</a>";

    			        	commandResp += "<br/>";
    			        	commandResp += "<br/>";
    						
    			        	var hrefValue = "<a href='#' ";
    			        	hrefValue += 'onclick="';
    			    		hrefValue += "openAsPopup('/app/common/entity/custjob.nl?stage=lead&whence=', 'Popup_lead" + "', 450,525)";
    			        	hrefValue += '"> VIEW LEAD(POPUP CENTERED) </a>';
    						
    			        	commandResp += hrefValue;
    			        	return commandResp;
    						break;
    					}
    					case "@@createsalesorder@@ for":
    					{
    						log.debug("create so for")
    						
    						if(!words[3])
    						{
    							commandResp += "missing information, please provide the target customer.";
    							return commandResp;
    							break;
    						}
    						
    						var targetCustomer = words[3];
    						var customerSearch_list = findCustomer(targetCustomer.replace(/@@/g, ""));
    						log.debug("customerSearch_list", customerSearch_list);
    						customerSearch_list.forEach(function(res){
    							commandResp += "<a target='_blank' href='/app/accounting/transactions/salesord.nl?whence='>CREATE SALES ORDER(NEW TAB)" + "for " + res.text + " (" + res.id + ")" + " (email:" + res.email + ")" + "</a>";
        			        	commandResp += "<br/>";
        			        	commandResp += "<br/>";
        			        	
        			        	var hrefValue = "<a href='#' ";
        			        	hrefValue += 'onclick="';
        			    		hrefValue += "openAsPopup('/app/accounting/transactions/salesord.nl?whence=&entity=" + res.id + "', 'Popup', 450,525)";
        			        	hrefValue += '"> CREATE SALES ORDER ' + "for " + res.text + " (" + res.id + ")" + " (email:" + res.email + ")" + '</a>';
        						
        			        	commandResp += hrefValue;
        			        	
    						})
    						
    						return commandResp;
    						break;
    					}
    					case "@@createsalesorder@@":
    					{
    						log.debug("create so")
    						commandResp = "<a target='_blank' href='/app/accounting/transactions/salesord.nl?whence='>CREATE SALES ORDER(NEW TAB)</a>";

    			        	commandResp += "<br/>";
    			        	commandResp += "<br/>";
    						
    			        	var hrefValue = "<a href='#' ";
    			        	hrefValue += 'onclick="';
    			    		hrefValue += "openAsPopup('/app/accounting/transactions/salesord.nl?whence=', 'Popup_so" + "', 450,525)";
    			        	hrefValue += '"> CREATE SALES ORDER(POPUP CENTERED) </a>';
    						
    			        	commandResp += hrefValue;
    			        	return commandResp;
    						break;
    					}

    					case "@@viewsalesorder@@":
    					{
    						if(!words[2])
    						{
    							commandResp += "missing information, please provide the target SO.";
    							return commandResp;
    							break;
    						}
    						
    						var targetSo = words[2];
    						var search_list = findSo(targetSo.replace(/@@/g, ""));
    						log.debug("search_list", search_list);
    						search_list.forEach(function(res){
    							var soId = res.id;
        						var soTranId = res.tranid;
        						var soTransactionNumber = res.transactionnumber;
        						
        						log.debug("view so")
        						commandResp = "<a target='_blank' href='/app/accounting/transactions/salesord.nl?whence='> VIEW SALES ORDER (NEW TAB)</a>";

        			        	commandResp += "<br/>";
        			        	commandResp += "<br/>";
        						
        			        	var hrefValue = "<a href='#' ";
        			        	hrefValue += 'onclick="';
        			    		hrefValue += "openAsPopup('/app/accounting/transactions/salesord.nl?id=" + soId + "', 'Popup_so_" + soId + "' , 450,525)";
        			    		hrefValue += '"> VIEW SALES ORDER ' + "" + "<br/> (doc_num:" + soTranId + ")" + "<br/> (tran_num:" + soTransactionNumber + ")" + "<br/> (internalid:" + soId + ")" + '</a>';
        												
        			        	commandResp += hrefValue;
        			        	
    						})
    						
    						
    						
    			        	return commandResp;
    						break;
    					}
    				}

        			return commandResp;
    			}
    			
    			
    		}
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		
    		if(chatbotResp_raw.length == 0)
    		{
    			return "Im sorry. I do not understand the message.";
    		}
    		log.debug("chatbotResp_raw", chatbotResp_raw);
    		chatbotResp_raw_arr = chatbotResp_raw.split(" ");
    		for(var a = 0 ; a < chatbotResp_raw_arr.length ; a++)
    		{
    		    if(chatbotResp_raw_arr[a].indexOf("{{") == -1)
    		    {
    		        tempResponse += chatbotResp_raw_arr[a] + " ";
    		        finalResp += chatbotResp_raw_arr[a] + " ";
    		    }
    		    else
    		    {
		        	log.debug("A", 0)
    		        if(chatbotResp_raw_arr[a].indexOf(".") == -1)
    		        {
    		        	log.debug("A", 1)
    		        }
    		        else
    		        {
    		        	log.debug("A", 2)
    		        	var word = chatbotResp_raw_arr[a];
    		        	log.debug("word", word)
    		            var tempword1 = word.substring(0+2,word.indexOf("."))
    		            var tempword2 = word.substring(word.indexOf(".")+1, word.length-2);
    		            log.debug("tempword1", tempword1)
    		            log.debug("tempword2", tempword2)
    		            if(tempword1 == "employee")
    		            {
    		                var empRec = record.load({type : "employee", id : runtime.getCurrentUser().id});
    		                res = empRec.getValue({fieldId : tempword2});

    		                
    		                finalResp += res + " ";
    		            }
    		        }
    		    }
    		}
    		
    		
    	}
    	else
    	{
    		return "Im sorry. I do not understand the message.";
    	}
    	
    	
    	
    	return finalResp;
    }
    
    function findSo(keyword)
    {
    	var search_list = [];
    	var filter1 = [];
    	filter1 = [["numbertext","is",keyword],"OR",["transactionnumbertext","is",keyword]]
    	
    	if(Number(keyword) != "NaN")
    	{
    		filter1.push("OR");
    		filter1.push(["internalidnumber","equalto",keyword]);
    	}
    	var filters =
  		   [
 		      filter1, 
 		      "AND", 
 		      ["mainline","is","T"], 
 		   ];
     	
    	
    	var searchObj = search.create({
    		   type: "transaction",
    		   filters:filters,
    		   columns:
    		   [
    		      search.createColumn({name: "transactionnumber", label: "Transaction Number"}),
    		      search.createColumn({name: "tranid", label: "Document Number"}),
    		      search.createColumn({name: "internalid", label: "Internal ID"}),
    		      search.createColumn({
    		         name: "entityid",
    		         join: "customer",
    		         label: "Name"
    		      })
    		   ]
    		});
    		var searchResultCount = searchObj.runPaged().count;
    		log.debug("customerSearchObj result count",searchResultCount);
    		searchObj.run().each(function(result){
    		   // .run().each has a limit of 4,000 results
    			
    			var obj = {
    					id:result.id,
    					transactionnumber:result.getValue({name: "transactionnumber", label: "Transaction Number"}),
    					tranid:result.getValue({name: "tranid", label: "Document Number"}),
    					entity_name:result.getValue({
    	    		         name: "entityid",
    	    		         join: "customer",
    	    		         label: "Name"
    	    		      })
    			};
    			search_list.push(obj);
    			
    		   return true;
    		});
    		
    		return search_list;
    }
    
    function findCustomer(keyword)
    {
    	var customerSearch_list = [];
    	var filters =
 		   [
		      ["entityid","haskeywords",keyword], 
		      "OR", 
		      ["firstname","contains",keyword], 
		      "OR", 
		      ["lastname","contains",keyword], 
		      "OR", 
		      ["email","contains",keyword], 
		      "AND", 
		      ["isinactive","is","F"]
		   ];
    	
    	if(Number(keyword) != "NaN")
    	{
    		filters.push("OR");
    		filters.push(["internalidnumber","equalto",keyword]);
    	}
    	
    	var customerSearchObj = search.create({
    		   type: "customer",
    		   filters:filters,
    		   columns:
    		   [
    		      search.createColumn({
    		         name: "entityid",
    		         sort: search.Sort.ASC,
    		         label: "Name"
    		      }),
    		      search.createColumn({name: "email", label: "Email"})
    		   ]
    		});
    		var searchResultCount = customerSearchObj.runPaged().count;
    		log.debug("customerSearchObj result count",searchResultCount);
    		customerSearchObj.run().each(function(result){
    		   // .run().each has a limit of 4,000 results
    			
    			var obj = {
    					id:result.id,
    					text:result.getValue({
			   		         name: "entityid",
					         sort: search.Sort.ASC,
					         label: "Name"
					      }),
    					email:result.getValue({name: "email", label: "Email"})
    			};
    			customerSearch_list.push(obj);
    			
    		   return true;
    		});
    		
    		return customerSearch_list;
    }
    
    function get_listOfContactsHtml()
    {
    	var currentUserInternalId = runtime.getCurrentUser().id;
    	var listOfContactsHtml = "";

    	listOfContactsHtml += "<script>" +
    	lib_chatbot.openChat +
    			"</script>";
    	
    	
    	log.debug("lib_chatbot", lib_chatbot);
    	//handle chatbot
    	var chatbot_latestmsg_id = "";
    	var customrecord_rd_chatbox_msgSearchObj = search.create({
			   type: "customrecord_rd_chatbox_msg",
			   filters:
			   [
					[["custrecord_rd_cm_author", "anyof", currentUserInternalId],
						"AND",
						["custrecord_rd_cm_recipient", "anyof", lib_chatbot.TEMP_CHATBOT_EMP_ID]],
						"OR",
						[["custrecord_rd_cm_author", "anyof", lib_chatbot.TEMP_CHATBOT_EMP_ID],
						"AND",
						["custrecord_rd_cm_recipient", "anyof", currentUserInternalId]],
			   ],
			   columns:
			   [
			      search.createColumn({
	    		         name: "internalid",
	    		         summary: "MAX",
	    		         label: "Internal ID"
	    		      }),
			   ]
			});
			var searchResultCount = customrecord_rd_chatbox_msgSearchObj.runPaged().count;
			log.debug("customrecord_rd_chatbox_msgSearchObj result count",searchResultCount);
			customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
			   // .run().each has a limit of 4,000 results
				chatbot_latestmsg_id = result.getValue({
   		         name: "internalid",
		         summary: "MAX",
		         label: "Internal ID"
		      })
			   return false;
			});
			
			
			if(chatbot_latestmsg_id)
			{
				var recObj = record.load({
					type : lib_chatbot.CHATBOX_MSG_RECORD.recordtype,
					id : chatbot_latestmsg_id
				});
				
				var chatboxUser_author = recObj.getValue({
					fieldId : lib_chatbot.CHATBOX_MSG_RECORD.fields.author,
				})
				var chatboxUser_authortext = recObj.getText({
					fieldId : lib_chatbot.CHATBOX_MSG_RECORD.fields.author,
				})
				var chatboxUser_recipient = recObj.getValue({
					fieldId : lib_chatbot.CHATBOX_MSG_RECORD.fields.recipient,
				})
				var chatboxUser_recipienttext = recObj.getText({
					fieldId : lib_chatbot.CHATBOX_MSG_RECORD.fields.recipient,
				})
				var chatboxMsg_last = recObj.getText({
					fieldId : lib_chatbot.CHATBOX_MSG_RECORD.fields.message,
				})
				var chatboxMsg_received = recObj.getValue({
					fieldId : "custrecord_rd_cm_received", //TODO use variable
				})
				
				if(chatboxMsg_last.length > 100)
      				{
      					chatboxMsg_last = chatboxMsg_last.substring(0, 100) + '...';
      				}
      				
				
				if(chatboxUser_author != currentUserInternalId)
				{
					if(chatboxMsg_received=='F' || !chatboxMsg_received)
					{
						listOfContactsHtml += "<div chatid='" + chatboxUser_authortext + "' onclick='" + "" + "openChat(" + chatboxUser_author + ")'>" + "<p class='unreadmsg'><b>" + chatboxUser_authortext + "</b></p>" + "<p><i>" + chatboxMsg_last + "</i></p>" + "</div>";
					}
					else
					{
						listOfContactsHtml += "<div chatid='" + chatboxUser_authortext + "' onclick='" + "" + "openChat(" + chatboxUser_author + ")'>" + "<p><b>" + chatboxUser_authortext + "</b></p>" + "<p><i>" + chatboxMsg_last + "</i></p>" + "</div>";
					}
					
				}
				else
				{
					listOfContactsHtml += "<div chatid='" + chatboxUser_recipienttext + "' onclick='" + "" + "openChat(" + chatboxUser_recipient + ")'>" + "<p><b>" + chatboxUser_recipienttext + "</b></p>" + "<p><i>" + chatboxMsg_last + "</i></p>" + "</div>";
				}
			}
			else
			{
				var chatbotEmployeeRec = record.load({
					type : "employee",
					id : lib_chatbot.TEMP_CHATBOT_EMP_ID
				});
				var chatboxUser_name = chatbotEmployeeRec.getValue({
					fieldId : "entityid"
				})
				
				//listOfContactsHtml += "<div onclick='" + "" + "openChat(" + lib_chatbot.TEMP_CHATBOT_EMP_ID + ")'>" + "<p><b>" + chatboxUser_name + "</b></p>" + "<p><i>" + "No conversation yet." + "</i></p>" + "</div>";
				listOfContactsHtml += "<div onclick='" + "" + "openChat(" + -999 + ")'>" + "<p><b>" + chatboxUser_name + "</b></p>" + "<p><i>" + "No conversation yet." + "</i></p>" + "</div>";
			}
			
			
			//handle chatbot
    	

//    	listOfContactsHtml += "<div onclick='" + "" + "openChat(" + -999 + ")'><p><b>Chatbot<><p></div>";
    	
    	var chatbox_message_ids = [];
    	var chatbox_message_employee_ids = [];
    	var maxes_customrecord_rd_chatbox_msgSearchObj = search.create({
    		   type: "customrecord_rd_chatbox_msg",
    		   filters:
    		   [
    		    	[["custrecord_rd_cm_author", "anyof", currentUserInternalId],
    		    	"OR",
    		    	["custrecord_rd_cm_recipient", "anyof", currentUserInternalId]],
    		    	"AND",
    		    	[["custrecord_rd_cm_author", "noneof", lib_chatbot.TEMP_CHATBOT_EMP_ID],
     		    	"AND",
     		    	["custrecord_rd_cm_recipient", "noneof", lib_chatbot.TEMP_CHATBOT_EMP_ID]],
    		   ],
    		   columns:
    		   [
    		      search.createColumn({
    		         name: "custrecord_rd_cm_author",
    		         summary: "GROUP",
    		         label: "Author"
    		      }),
    		      search.createColumn({
    		         name: "custrecord_rd_cm_recipient",
    		         summary: "GROUP",
    		         label: "Recipient"
    		      }),
    		      search.createColumn({
    		         name: "created",
    		         summary: "MAX",
    		         sort: search.Sort.DESC,
    		         label: "Date Created"
    		      }),
    		      search.createColumn({
    		         name: "internalid",
    		         summary: "MAX",
    		         label: "Internal ID"
    		      })
    		   ]
    		});
    		var searchResultCount = maxes_customrecord_rd_chatbox_msgSearchObj.runPaged().count;
    		log.debug("customrecord_rd_chatbox_msgSearchObj result count",searchResultCount);
    		maxes_customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
    		   // .run().each has a limit of 4,000 results
    			var chatbox_message_id = result.getValue({
    		         name: "internalid",
    		         summary: "MAX",
    		         label: "Internal ID"
    		      })
    		      var chatbox_message_author_id = result.getValue({
    		         name: "custrecord_rd_cm_author",
    		         summary: "GROUP",
    		         label: "Author"
    		      })
    		      var chatbox_message_recipient_id = result.getValue({
    		         name: "custrecord_rd_cm_recipient",
    		         summary: "GROUP",
    		         label: "Recipient"
    		      })
    			chatbox_message_ids.push(chatbox_message_id);
    			if(chatbox_message_employee_ids.indexOf(chatbox_message_author_id) == -1){
    				chatbox_message_employee_ids.push(chatbox_message_author_id);
    			}
    			else if(chatbox_message_employee_ids.indexOf(chatbox_message_recipient_id) == -1){
    				chatbox_message_employee_ids.push(chatbox_message_recipient_id);
    			}
    		   return true;
    		});
    		
    		log.debug("chatbox_message_ids", chatbox_message_ids);
    		
    		if(chatbox_message_ids && chatbox_message_ids.length > 0)
    		{
    			var customrecord_rd_chatbox_msgSearchObj = search.create({
     			   type: "customrecord_rd_chatbox_msg",
     			   filters:
     			   [
     			    	["internalid", "anyof", chatbox_message_ids]
     			   ],
     			   columns:
     			   [
     			      search.createColumn({
     			         name: "name",
     			         sort: search.Sort.ASC,
     			         label: "Name"
     			      }),
     			      search.createColumn({name: "custrecord_rd_cm_author", label: "Author"}),
     			      search.createColumn({name: "custrecord_rd_cm_recipient", label: "Recipient"}),
     			      search.createColumn({
     			         name: "created",
     			         sort: search.Sort.DESC,
     			         label: "Date Created"
     			      }),
     			      search.createColumn({name: "custrecord_rd_cm_message", label: "Message"}),
     			      search.createColumn({name: "internalid", label: "Internal ID"})
     			   ]
     			});
     			var searchResultCount = customrecord_rd_chatbox_msgSearchObj.runPaged().count;
     			log.debug("customrecord_rd_chatbox_msgSearchObj result count",searchResultCount);
     			customrecord_rd_chatbox_msgSearchObj.run().each(function(result){
     			   // .run().each has a limit of 4,000 results
     				var chatboxUser_author = result.getValue({name: "custrecord_rd_cm_author", label: "Author"});
     				var chatboxUser_authortext = result.getText({name: "custrecord_rd_cm_author", label: "Author"});
     				var chatboxUser_recipient = result.getValue({name: "custrecord_rd_cm_recipient", label: "Recipient"});
     				var chatboxUser_recipienttext = result.getText({name: "custrecord_rd_cm_recipient", label: "Recipient"});
     				var chatboxMsg_last = result.getValue({name: "custrecord_rd_cm_message", label: "Message"});

     				if(chatboxMsg_last.length > 100)
      				{
      					chatboxMsg_last = chatboxMsg_last.substring(0, 100) + '...';
      				}
      				
     				
     				if(chatboxUser_author != currentUserInternalId)
     				{
     					listOfContactsHtml += "<div onclick='" + "" + "openChat(" + chatboxUser_author + ")'>" + "<p><b>" + chatboxUser_authortext + "</b></p>" + "<p><i>" + chatboxMsg_last + "</i></p>" + "</div>";
     				}
     				else
     				{
     					listOfContactsHtml += "<div onclick='" + "" + "openChat(" + chatboxUser_recipient + ")'>" + "<p><b>" + chatboxUser_recipienttext + "</b></p>" + "<p><i>" + chatboxMsg_last + "</i></p>" + "</div>";
     				}
     			   return true;
     			});
    		}
    		
    	
    		var filters = [
					//["custentity_rd_cm_ischatboxuser","is","T"], 
					//"AND", 
					["isinactive","is","F"], 
					"AND", 
					["access","is","T"]];
    		
    		if(chatbox_message_employee_ids && chatbox_message_employee_ids.length > 0)
    		{
    			filters.push("AND");
    			filters.push(["internalid","noneof",chatbox_message_employee_ids]);
    		}
    		
    	var employeeSearchObj = search.create({
    		   type: "employee",
    		   filters:filters,
    		   columns:
    		   [
    		      search.createColumn({
    		         name: "entityid",
    		         sort: search.Sort.ASC,
    		         label: "Name"
    		      }),
    		      search.createColumn({name: "email", label: "Email"}),
    		      search.createColumn({name: "phone", label: "Phone"}),
    		      search.createColumn({name: "custentity_rd_cm_chatboximage", label: "Chatbox Image"})
    		   ]
    		});
    		var searchResultCount = employeeSearchObj.runPaged().count;
    		log.debug("employeeSearchObj result count",searchResultCount);
    		employeeSearchObj.run().each(function(result){
    		   // .run().each has a limit of 4,000 results
    			
    			var chatboxUser_name = result.getValue({
      		         name: "entityid",
    		         label: "Name"
    		      });

    	    	listOfContactsHtml += "<div onclick='" + "" + "openChat(" + result.id + ")'>" + "<p><b>" + chatboxUser_name + "</b></p>" + "<p><i>" + "No conversation yet." + "</i></p>" + "</div>";
//    	    	listOfContactsHtml += "<div onclick='" + "" + "openChat(5)'>P DAWG</div>";
//    	    	listOfContactsHtml += "<div onclick='" + "" + "openChat(6)'>Franz Reynolds</div>";
//    	    	listOfContactsHtml += "<div onclick='" + "" + "openChat(7)'>Kaye</div>";
//    	    	listOfContactsHtml += "<div onclick='alert(" + '"via inline code"' + ")'" + ">Kaye</div>";
    			
    		   return true;
    		});
    	
    	
    	return listOfContactsHtml;
    }
    
//    function openChat(empId)
//    {
//    	jQuery('#chat-container')[0].innerHTML = window.nlapiRequestURL("https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&empId=" + empId, JSON.stringify({empId : empId}), null, null, 'GET').body;
//    	
//    	console.log("RD_SL_chatbot.js empId", empId);
//		
//		var elem = document.getElementById("chat-messages");
//		console.log("elem",elem)
//		elem.scrollTop = elem.scrollHeight;
//    }
    
    function openChat_backup(empId)
    {
    	alert('via function openchat, empId : ' + empId);
    	$('#chatcontainer')[0].innerHTML = window.nlapiRequestURL("https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&empId=" + empId, JSON.stringify({empId : empId}), null, null, 'GET');
    	var slUrl = "https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&empId=" + empId;
    	var dialogHtml = window.nlapiRequestURL(slUrl, JSON.stringify({empId : empId}), null, null, 'GET');
    	$('#chatcontainer')[0].innerHTML = dialogHtml;
    }
    
//    function submitMsg()
//	{
//		try
//		{
//			var msg = $(".chat-input")[0].value;
//			console.log("msg", msg);
//			
//			var slUrl = "https://tstdrv1469253.app.netsuite.com/app/site/hosting/scriptlet.nl?script=2501&deploy=1" + "&message=" + msg + "&recipient=" + 38719 + "&author=" + 38719;
//			
//			var requestUrl_response = window.nlapiRequestURL(slUrl, JSON.stringify({message : msg, recipient : 38719, author : 38719}), null, null, 'POST');
//			
//			console.log("RD_SL_chatbot.js requestUrl_response", requestUrl_response);
//			
//			var elem = document.getElementById("chat-messages");
//			console.log("elem",elem)
//			elem.scrollTop = elem.scrollHeight;
//			
////			var resp = $.post({
////				url : slUrl,
////				type : "POST",
////				//data : jQuery.param({msg : msg, recipient : 38719, sender : 38719}),
////				data : {msg : msg, recipient : 38719, sender : 38719},
////				//contentType: "application/json;charset=utf8",
////				dataType: "json",
////				success: function(data) {
////				      console.log("success data", data)
////				},
////			    error: function(data) {
////			    	console.log("error data", data)
////			    },
////				
////				
////			});
////	    	console.log(" resp", resp)
//			
//		}
//		catch(e)
//		{
//			console.log("ERROR in function submitMsg", e)
//		}
//	}

    return {
        onRequest: onRequest
    };
    
});
