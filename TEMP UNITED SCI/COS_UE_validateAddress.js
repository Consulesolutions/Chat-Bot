/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @Author Rodmar Dimasaca
 * @Email rod@consulesolutions.com
 * @Project Revival Parts
 * @Date Sept 26, 2023
 * @Filename COS_UE_validateAddress.js
 */

/**
 * Script Name          :   COS UE validateAddress
 * File Name            :   COS_UE_validateAddress.js
 * 
 * Description          :   
 * 
 * Dependencies         :   format--- <this File Name> <is used by/uses> <this Dependency>
 * Libraries            :   
 * 
 * Version              :   1.0.0 initial version
 * 
 * 
 * Notes                :   
 * 
 * TODOs                :   
 * 
 */
define(['N/https', 'N/record', 'N/search'],
/**
 * @param {https} https
 * @param {record} record
 * @param {search} search
 */
function(https, record, search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} targetRec - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
	 * @governance 0
     */
    function beforeLoad(scriptContext)
    {
    	try
    	{
            if(scriptContext.type == "view" || scriptContext.type == "edit")
            {
                
            }
    	}
    	catch(e)
    	{
    		log.error("ERROR in function beforeLoad", {stack : e.stack, message : e.message});
    	}
    }

    function afterSubmit(scriptContext)
    {
    	try
    	{
            log.debug("afterSubmit scriptContext", scriptContext)
            if(scriptContext.type == "create" || scriptContext.type == "edit")
            {
                var targetRec = record.load({
                    id : scriptContext.newRecord.id,
                    type : scriptContext.newRecord.type
                })
                var shipAddr = getShippingAddress_viaSubrecord(targetRec);
                // var billAddr = getBillingAddress_viaSubrecord(targetRec);
                //prabodh said it dont need to run on billaddr as of 10302023
                var billAddr = "";
                // var billAddr = getBillingAddress_viaSubrecord(targetRec);
                log.debug("afterSubmit shipAddr", shipAddr)
                log.debug("afterSubmit billAddr", billAddr)

                if(shipAddr || billAddr)
                {
                    var shipAddr_result = "";
                    var billAddr_result = "";

                    if(shipAddr)
                    {
                        shipAddr_result = validateAddr(shipAddr);
                    }
                    if(billAddr)
                    {
                        billAddr_result = validateAddr(billAddr);
                    }

					if(shipAddr_result.origAddress && shipAddr_result.origAddress.addressBreakdown && shipAddr_result.origAddress.addressBreakdown.addrtext)
					{
						targetRec.setValue({
							fieldId : "custbody_cos_shipaddr_orig",
							value : shipAddr_result.origAddress.addressBreakdown.addrtext
						})
						
						if(scriptContext.type == "create")
						{
							targetRec.setValue({
								fieldId : "custbody_cos_shipaddr_orig_create",
								value : shipAddr_result.origAddress.addressBreakdown.addrtext
							})
						}
					}
                    

                    if(shipAddr_result.hasIssues)
                    {
                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msg",
                            value : "ISSUES FOUND:the orig ship address" + `
                            
                            ${JSON.stringify(shipAddr_result.origAddress, null, 1)}

                            ` + "returned/corrected by GOOGLE and SUITESCRIPT as" + `
                            
                            ${JSON.stringify(shipAddr_result.newAddress, null, 1)}

                            ` + "is deemed to be inaccurate" + "\n\n" + JSON.stringify(shipAddr_result.respBody_result, null, 1) + "\n\n SUGGESTED USPS STANDARDIZED FORMAT: \n" + JSON.stringify(shipAddr_result.uspsData, null, 1)
                        })
						
						targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msgtrim",
                            value : trimmedMsg(shipAddr_result.respBody_result, shipAddr_result.uspsData)
                        })

                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddrneedsreview",
                            value : true
                        })+

                        // updateOrderAddress("ship", targetRec, shipAddr_result);
                        updateOrderAddress_viaSubrecord("ship", targetRec, shipAddr_result);
                    }
                    else
                    {
                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msg",
                            value : "NO ISSUES FOUND:the ship address " + `
                            
                            ${JSON.stringify(shipAddr_result.origAddress, null, 1)}

                            ` + "returned/corrected by GOOGLE and SUITESCRIPT as" + `
                            
                            ${JSON.stringify(shipAddr_result.newAddress, null, 1)}

                            ` + "is deemed to be reliable enough" + "\n\n" + JSON.stringify(shipAddr_result.respBody_result, null, 1) + "\n\n SUGGESTED USPS STANDARDIZED FORMAT: \n" + JSON.stringify(shipAddr_result.uspsData, null, 1)
                        })
						
						targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msgtrim",
                            value : trimmedMsg(shipAddr_result.respBody_result, shipAddr_result.uspsData)
                        })

                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddrneedsreview",
                            value : false
                        })

                        // updateOrderAddress("ship", targetRec, shipAddr_result);
                        updateOrderAddress_viaSubrecord("ship", targetRec, shipAddr_result);
                    }

                    if(billAddr_result.hasIssues)
                    {
                        targetRec.setValue({
                            fieldId : "custbody_cos_billaddr_msg",
                            value : "ISSUES FOUND:the orig bill address " + `
                            
                            ${JSON.stringify(billAddr_result.origAddress, null, 1)}

                            ` + "returned/corrected by GOOGLE and SUITESCRIPT as" + `
                            
                            ${JSON.stringify(billAddr_result.newAddress, null, 1)}

                            ` + "is deemed to be inaccurate" + "\n\n" + JSON.stringify(billAddr_result.respBody_result, null, 1) + "\n\n SUGGESTED USPS STANDARDIZED FORMAT: \n" + JSON.stringify(shipAddr_result.uspsData, null, 1)
                        })
						
						targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msgtrim",
                            value : trimmedMsg(shipAddr_result.respBody_result, shipAddr_result.uspsData)
                        })

                        targetRec.setValue({
                            fieldId : "custbody_cos_billaddrneedsreview",
                            value : true
                        })

                        // updateOrderAddress("bill", targetRec, billAddr_result);
                        updateOrderAddress_viaSubrecord("bill", targetRec, billAddr_result);
                    }
                    else
                    {
                        targetRec.setValue({
                            fieldId : "custbody_cos_billaddr_msg",
                            value : "NO ISSUES FOUND:the orig bill address" + `
                            
                            ${JSON.stringify(billAddr_result.origAddress, null, 1)}

                            ` + "returned/corrected by GOOGLE and SUITESCRIPT as" + `
                            
                            ${JSON.stringify(billAddr_result.newAddress, null, 1)}

                            ` + "is deemed to be reliable enough" + "\n\n" + JSON.stringify(billAddr_result.respBody_result, null, 1) + "\n\n SUGGESTED USPS STANDARDIZED FORMAT: \n" + JSON.stringify(shipAddr_result.uspsData, null, 1)
                        })
						
						targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msgtrim",
                            value : trimmedMsg(shipAddr_result.respBody_result, shipAddr_result.uspsData)
                        })

                        targetRec.setValue({
                            fieldId : "custbody_cos_billaddrneedsreview",
                            value : false
                        })

                        // updateOrderAddress("bill", targetRec, billAddr_result);
                        updateOrderAddress_viaSubrecord("bill", targetRec, billAddr_result);
                    }

                    if(shipAddr_result && shipAddr_result.respBody_result && shipAddr_result.respBody_result.missingComponentTypes && shipAddr_result.respBody_result.missingComponentTypes.includes("postal_code"))
                    {
                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msg",
                            value : "ISSUES FOUND:the orig ship address" + `
                            
                            ${JSON.stringify(shipAddr_result.origAddress, null, 1)}

                            ` + "returned/corrected by GOOGLE and SUITESCRIPT as" + `
                            
                            ${JSON.stringify(shipAddr_result.newAddress, null, 1)}

                            ` + "is deemed to be inaccurate" + "\n\n" + JSON.stringify(shipAddr_result.respBody_result, null, 1) + "\n\n SUGGESTED USPS STANDARDIZED FORMAT: \n" + JSON.stringify(shipAddr_result.uspsData, null, 1)
                        })
						
						targetRec.setValue({
                            fieldId : "custbody_cos_shipaddr_msgtrim",
                            value : trimmedMsg(shipAddr_result.respBody_result, shipAddr_result.uspsData)
                        })

                        targetRec.setValue({
                            fieldId : "custbody_cos_shipaddrneedsreview",
                            value : true
                        })+

                        // updateOrderAddress("ship", targetRec, shipAddr_result);
                        updateOrderAddress_viaSubrecord("ship", targetRec, shipAddr_result);

                        targetRec.setValue({
                            fieldId : "custbody_cos_billaddrneedsreview",
                            value : true
                        })
                    }


                    var submittedRecId = targetRec.save({
                        ignoreMandatoryFields : true,
                        allowSourcing : true
                    });

                    log.debug("submittedRecId", submittedRecId)
                }
            }
    	}
    	catch(e)
    	{
    		log.error("ERROR in function afterSubmit", {stack : e.stack, message : e.message});
    	}
    }
	
	function trimmedMsg(newAddress, uspsData)
	{
		var funcRes = "";
		var msgLines = [];
		for(var a = 0 ; a < newAddress.addressComponents.length ; a++)
		{
			var addrComp = newAddress.addressComponents[a];
			msgLines.push(addrComp.componentType + " : " + addrComp.componentName.text + " : " + addrComp.confirmationLevel);
		}
		funcRes = msgLines.join("\n");
		
		funcRes += "\n\nGOOGLE USPS INFO:\n" + JSON.stringify(uspsData, null, 2);
		
		return funcRes;
	}

    function updateOrderAddress_viaSubrecord(addrtype, targetRec, addr_result)
    {
        try{
            if(addr_result.newAddress && addr_result.newAddress.length)
            {

                // targetRec.setValue({
                //     fieldId : addrtype + "addresslist",
                //     value : -2
                // });

                var subRec = targetRec.getSubrecord({
                    fieldId: addrtype == "bill" ? 'billingaddress' : 'shippingaddress' // or billingaddress
                });

                for(var a = 0 ; a < addr_result.newAddress.length ; a++)
                {
                    var nsAddrComponent = addr_result.newAddress[a];
                    // nsAddrComponent.fieldId = addrtype + nsAddrComponent.fieldId;
                    log.debug("updateOrderAddress setting addr field", nsAddrComponent);
                    if(!nsAddrComponent.value || nsAddrComponent.value == "" && nsAddrComponent.value == "null" || nsAddrComponent.value == "undefined")
                    {
                        continue;
                    }
                    if(nsAddrComponent.fieldId == "country" || nsAddrComponent.fieldId == "country")
                    {
                        if(nsAddrComponent.value == "USA")
                        {
                            nsAddrComponent.value = "US"
                        }
                    }
                    // if(nsAddrComponent.fieldId == "addr1" || nsAddrComponent.fieldId == "addr1")
                    // {
                    //     nsAddrComponent.value = "test111"
                    // }
                    subRec.setValue(nsAddrComponent);

                }
            }
        }
        catch(e)
        {
            log.error("ERROR updating order address", e.message);
        }
    }

    function updateOrderAddress(addrtype, targetRec, addr_result)
    {
        try{
            if(addr_result.newAddress.length)
            {

                targetRec.setValue({
                    fieldId : addrtype + "addresslist",
                    value : -2
                });

                for(var a = 0 ; a < addr_result.newAddress.length ; a++)
                {
                    var nsAddrComponent = addr_result.newAddress[a];
                    nsAddrComponent.fieldId = addrtype + nsAddrComponent.fieldId;
                    log.debug("updateOrderAddress setting addr field", nsAddrComponent);
                    if(nsAddrComponent.fieldId == "billcountry" || nsAddrComponent.fieldId == "shipcountry")
                    {
                        if(nsAddrComponent.value == "USA")
                        {
                            nsAddrComponent.value = "US"
                        }
                    }
                    targetRec.setValue(nsAddrComponent);
                    if(nsAddrComponent.fieldId == "billaddr1")
                    {
                        nsAddrComponent.fieldId = "billaddress1"

                        targetRec.setValue(nsAddrComponent);

                        nsAddrComponent.fieldId = "billingaddress1"

                        targetRec.setValue(nsAddrComponent);

                        nsAddrComponent.fieldId = "billingaddr1"

                        targetRec.setValue(nsAddrComponent);
                    }
                    if(nsAddrComponent.fieldId == "shipaddr1")
                    {
                        nsAddrComponent.fieldId = "shipaddress1"

                        targetRec.setValue(nsAddrComponent);

                        nsAddrComponent.fieldId = "shipingaddress1"

                        targetRec.setValue(nsAddrComponent);

                        nsAddrComponent.fieldId = "shipingaddr1"

                        targetRec.setValue(nsAddrComponent);
                    }
                    targetRec.setValue(nsAddrComponent);
                }
            }
        }
        catch(e)
        {
            log.error("ERROR updating order address", e.message);
        }
    }

    function getBillingAddress(targetRec)
    {
        log.debug(`targetRec.getValue({
            fieldId : "billaddressee"
        })`, targetRec.getValue({
            fieldId : "billaddressee"
        }))

        log.debug(`lookup billaddress`, search.lookupFields({
            type : targetRec.type,
            id : targetRec.id,
            columns : ["billaddressee"]
        }));

        var addrLookup = search.lookupFields({
            type : targetRec.type,
            id : targetRec.id,
            columns : ["billaddressee", "billattention", "billaddress", "billaddress1", "billaddress2", "billaddress3", "billcity", "billstate", "billzip", "billcountry"]
        });

        log.debug("getBillingAddress addrLookup", addrLookup)

        var addressInfo = {addressBreakdown : {}};
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "shippingaddress_text"
        })
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "billingaddress_text"
        })
        addressInfo.addressBreakdown.shipaddressee = targetRec.getValue({
            fieldId : "billaddressee"
        })
        addressInfo.addressBreakdown.billattention = targetRec.getValue({
            fieldId : "billattention"
        })
        addressInfo.addressBreakdown.billaddr1 = targetRec.getValue({
            fieldId : "billaddr1"
        })
        addressInfo.addressBreakdown.billaddr2 = targetRec.getValue({
            fieldId : "billaddr2"
        })
        addressInfo.addressBreakdown.billaddr3 = targetRec.getValue({
            fieldId : "billaddr3"
        })
        addressInfo.addressBreakdown.billcity = targetRec.getValue({
            fieldId : "billcity"
        })
        addressInfo.addressBreakdown.billstate = targetRec.getValue({
            fieldId : "billstate"
        })
        addressInfo.addressBreakdown.billzip = targetRec.getValue({
            fieldId : "billzip"
        })
        addressInfo.addressBreakdown.billcountry = targetRec.getValue({
            fieldId : "billcountry"
        })

        log.debug("getBillingAddress addressInfo via getValue", addressInfo)
        log.debug("getBillingAddress addrLookup", addrLookup)

        var addressInfo = {addressBreakdown : {}};

        for(var addrComponent in addrLookup)
        {
            if(addrLookup[addrComponent] && addrLookup[addrComponent][0] && addrLookup[addrComponent][0].value)
            {
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent][0].value
            }
            else{
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent]
            }
        }

        //do this because lookup will return addr1 if attention is empty //TODO seems like still a problem
        addressInfo.addressBreakdown.billattention = targetRec.getValue({
            fieldId : "billattention"
        })

        log.debug("addressInfo billing", addressInfo)
        return addressInfo;
    }

    function getShippingAddress(targetRec)
    {
        log.debug(`targetRec.getValue({
            fieldId : "shipaddressee"
        })`, targetRec.getValue({
            fieldId : "shipaddressee"
        }))

        var addrLookup = search.lookupFields({
            type : targetRec.type,
            id : targetRec.id,
            columns : ["shipaddressee", "shipattention", "shipaddress", "shipaddress1", "shipaddress2", "shipaddress3", "shipcity", "shipstate", "shipzip", "shipcountry"]
        });

        var addressInfo = {addressBreakdown : {}};
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "shippingaddress_text"
        })
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "shippingaddress_text"
        })
        addressInfo.addressBreakdown.shipaddressee = targetRec.getValue({
            fieldId : "shipaddressee"
        })
        addressInfo.addressBreakdown.shipattention = targetRec.getValue({
            fieldId : "shipattention"
        })
        addressInfo.addressBreakdown.shipaddr1 = targetRec.getValue({
            fieldId : "shipaddr1"
        })
        addressInfo.addressBreakdown.shipaddr2 = targetRec.getValue({
            fieldId : "shipaddr2"
        })
        addressInfo.addressBreakdown.shipaddr3 = targetRec.getValue({
            fieldId : "shipaddr3"
        })
        addressInfo.addressBreakdown.shipcity = targetRec.getValue({
            fieldId : "shipcity"
        })
        addressInfo.addressBreakdown.shipstate = targetRec.getValue({
            fieldId : "shipstate"
        })
        addressInfo.addressBreakdown.shipzip = targetRec.getValue({
            fieldId : "shipzip"
        })
        addressInfo.addressBreakdown.shipcountry = targetRec.getValue({
            fieldId : "shipcountry"
        })

        log.debug("getShippingAddress addressInfo via getValue", addressInfo)
        log.debug("getShippingAddress addrLookup", addrLookup)

        var addressInfo = {addressBreakdown : {}};

        for(var addrComponent in addrLookup)
        {
            if(addrLookup[addrComponent] && addrLookup[addrComponent][0] && addrLookup[addrComponent][0].value)
            {
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent][0].value
            }
            else{
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent]
            }
        }
        
        //do this because lookup will return addr1 if attention is empty //TODO seems like still a problem
        addressInfo.addressBreakdown.shipattention = targetRec.getValue({
            fieldId : "shipattention"
        })

        

        log.debug("addressInfo", addressInfo)
        return addressInfo;
    }

    function getShippingAddress_viaSubrecord(targetRec)
    {
        log.debug(`targetRec.getValue({
            fieldId : "shipaddressee"
        })`, targetRec.getValue({
            fieldId : "shipaddressee"
        }))

        var addrLookup = search.lookupFields({
            type : targetRec.type,
            id : targetRec.id,
            columns : ["shipaddressee", "shipattention", "shipaddress", "shipaddress1", "shipaddress2", "shipaddress3", "shipcity", "shipstate", "shipzip", "shipcountry"]
        });

        var addressInfo = {addressBreakdown : {}};
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "shippingaddress_text"
        })
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "shippingaddress_text"
        })
        addressInfo.addressBreakdown.shipaddressee = targetRec.getValue({
            fieldId : "shipaddressee"
        })
        addressInfo.addressBreakdown.shipattention = targetRec.getValue({
            fieldId : "shipattention"
        })
        addressInfo.addressBreakdown.shipaddr1 = targetRec.getValue({
            fieldId : "shipaddr1"
        })
        addressInfo.addressBreakdown.shipaddr2 = targetRec.getValue({
            fieldId : "shipaddr2"
        })
        addressInfo.addressBreakdown.shipaddr3 = targetRec.getValue({
            fieldId : "shipaddr3"
        })
        addressInfo.addressBreakdown.shipcity = targetRec.getValue({
            fieldId : "shipcity"
        })
        addressInfo.addressBreakdown.shipstate = targetRec.getValue({
            fieldId : "shipstate"
        })
        addressInfo.addressBreakdown.shipzip = targetRec.getValue({
            fieldId : "shipzip"
        })
        addressInfo.addressBreakdown.shipcountry = targetRec.getValue({
            fieldId : "shipcountry"
        })

        log.debug("getShippingAddress addressInfo via getValue", addressInfo)
        log.debug("getShippingAddress addrLookup", addrLookup)

        var addressInfo = {addressBreakdown : {}};

        for(var addrComponent in addrLookup)
        {
            if(addrLookup[addrComponent] && addrLookup[addrComponent][0] && addrLookup[addrComponent][0].value)
            {
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent][0].value
            }
            else{
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent]
            }
        }
        
        //do this because lookup will return addr1 if attention is empty //TODO seems like still a problem
        addressInfo.addressBreakdown.shipattention = targetRec.getValue({
            fieldId : "shipattention"
        })

        // var targetRec = targetRec.getSubrecord({
        //     fieldId : "shipaddresslist"
        // });
        var subRec = targetRec.getSubrecord({
            fieldId: 'shippingaddress' // or billingaddress
        });
        addressInfo.addressBreakdown.addrtext = subRec.getValue({
            fieldId : "addrtext"
        })
        addressInfo.addressBreakdown.shipaddressee = subRec.getValue({
            fieldId : "addressee"
        })
        addressInfo.addressBreakdown.shipattention = subRec.getValue({
            fieldId : "attention"
        })
        addressInfo.addressBreakdown.shipaddr1 = subRec.getValue({
            fieldId : "addr1"
        })
        addressInfo.addressBreakdown.shipaddr2 = subRec.getValue({
            fieldId : "addr2"
        })
        addressInfo.addressBreakdown.shipaddr3 = subRec.getValue({
            fieldId : "addr3"
        })
        addressInfo.addressBreakdown.shipcity = subRec.getValue({
            fieldId : "city"
        })
        addressInfo.addressBreakdown.shipstate = subRec.getValue({
            fieldId : "state"
        })
        addressInfo.addressBreakdown.shipzip = subRec.getValue({
            fieldId : "zip"
        })
        addressInfo.addressBreakdown.shipcountry = subRec.getValue({
            fieldId : "country"
        })

        log.debug("addressInfo shipping", addressInfo)
        return addressInfo;
    }

    function getBillingAddress_viaSubrecord(targetRec)
    {
        log.debug(`targetRec.getValue({
            fieldId : "billaddressee"
        })`, targetRec.getValue({
            fieldId : "billaddressee"
        }))

        var addrLookup = search.lookupFields({
            type : targetRec.type,
            id : targetRec.id,
            columns : ["billaddressee", "billattention", "billaddress", "billaddress1", "billaddress2", "billaddress3", "billcity", "billstate", "billzip", "billcountry"]
        });

        var addressInfo = {addressBreakdown : {}};
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "billingaddress_text"
        })
        addressInfo.addressBreakdown.addrtext = targetRec.getValue({
            fieldId : "billingaddress_text"
        })
        addressInfo.addressBreakdown.billaddressee = targetRec.getValue({
            fieldId : "billaddressee"
        })
        addressInfo.addressBreakdown.billattention = targetRec.getValue({
            fieldId : "billattention"
        })
        addressInfo.addressBreakdown.billaddr1 = targetRec.getValue({
            fieldId : "billaddr1"
        })
        addressInfo.addressBreakdown.billaddr2 = targetRec.getValue({
            fieldId : "billaddr2"
        })
        addressInfo.addressBreakdown.billaddr3 = targetRec.getValue({
            fieldId : "billaddr3"
        })
        addressInfo.addressBreakdown.billcity = targetRec.getValue({
            fieldId : "billcity"
        })
        addressInfo.addressBreakdown.billstate = targetRec.getValue({
            fieldId : "billstate"
        })
        addressInfo.addressBreakdown.billzip = targetRec.getValue({
            fieldId : "billzip"
        })
        addressInfo.addressBreakdown.billcountry = targetRec.getValue({
            fieldId : "billcountry"
        })

        log.debug("getbillingAddress addressInfo via getValue", addressInfo)
        log.debug("getbillingAddress addrLookup", addrLookup)

        var addressInfo = {addressBreakdown : {}};

        for(var addrComponent in addrLookup)
        {
            if(addrLookup[addrComponent] && addrLookup[addrComponent][0] && addrLookup[addrComponent][0].value)
            {
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent][0].value
            }
            else{
                addressInfo.addressBreakdown[addrComponent] = addrLookup[addrComponent]
            }
        }
        
        //do this because lookup will return addr1 if attention is empty //TODO seems like still a problem
        addressInfo.addressBreakdown.billattention = targetRec.getValue({
            fieldId : "billattention"
        })

        // var targetRec = targetRec.getSubrecord({
        //     fieldId : "billaddresslist"
        // });
        var subRec = targetRec.getSubrecord({
            fieldId: 'billingaddress' // or billingaddress
        });
        addressInfo.addressBreakdown.addrtext = subRec.getValue({
            fieldId : "addrtext"
        })
        addressInfo.addressBreakdown.billaddressee = subRec.getValue({
            fieldId : "addressee"
        })
        addressInfo.addressBreakdown.billattention = subRec.getValue({
            fieldId : "attention"
        })
        addressInfo.addressBreakdown.billaddr1 = subRec.getValue({
            fieldId : "addr1"
        })
        addressInfo.addressBreakdown.billaddr2 = subRec.getValue({
            fieldId : "addr2"
        })
        addressInfo.addressBreakdown.billaddr3 = subRec.getValue({
            fieldId : "addr3"
        })
        addressInfo.addressBreakdown.billcity = subRec.getValue({
            fieldId : "city"
        })
        addressInfo.addressBreakdown.billstate = subRec.getValue({
            fieldId : "state"
        })
        addressInfo.addressBreakdown.billzip = subRec.getValue({
            fieldId : "zip"
        })
        addressInfo.addressBreakdown.billcountry = subRec.getValue({
            fieldId : "country"
        })

        log.debug("addressInfo billing", addressInfo)
        return addressInfo;
    }

    //getshipingAddress

    function validateAddr(addr)
    {
        var functionResult = {};

        //for tests
        // var origAddrComponents = {
        //     // postalCode : {
        //     postal_code : {
        //         value : 33626,
        //         mapsTo : "zip"
        //     },
        //     point_of_interest : {
        //         value : "LI'L SUNSHINE SMILES DENTISTRY",
        //         mapsTo : "addr1",
        //         doIgnore : true
        //     },
        //     street_number : {
        //         value : "12950",
        //         mapsTo : "addr1"
        //     },
        //     "route" : {
        //         value : "Race Track Road",
        //         mapsTo : "addr1"
        //     },
        //     "subpremise" : {
        //         value : "SUITE 109",
        //         mapsTo : "addr1"
        //     },
        //     "locality" : {
        //         value : "Tampa",
        //         mapsTo : "city"
        //     },
        //     "administrative_area_level_1" : {
        //         value : "FL",
        //         mapsTo : "state"
        //     },
        //     "country" : {
        //         value : "United States",
        //         mapsTo : "country"
        //     },
        //     "postal_code_suffix" : {
        //         value : /* "1304" */"",
        //         mapsTo : "zip"
        //     }
        // }
        // var addrObj = {
        //     "address": {
        //           "addressLines": [
        //               "LI'L SUNSHINE SMILES DENTISTRY",
        //               "12950 RACE TRACK RD",
        //               "SUITE 109",
        //               "Tampa FL 33626",
        //               "United States"
        //           ]
        //     }
        // };


        //retrieve the actual address info
        var origAddrComponents = {
            // postalCode : {
            postal_code : {
                value : (addr.addressBreakdown.billzip || addr.addressBreakdown.shipzip) || "",
                mapsTo : "zip"
            },
            point_of_interest : {
                value : (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1) || "",
                mapsTo : "addr1",
                doIgnore : true
            },
            street_number : {
                value : (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1) || "",
                mapsTo : "addr1"
            },
            "route" : {
                value : (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1) || "",
                mapsTo : "addr1"
            },
            "subpremise" : {
                value : (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1) || "",
                mapsTo : "addr1"
            },
            "locality" : {
                value : (addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity) || "",
                mapsTo : "city"
            },
            "administrative_area_level_1" : {
                value : (addr.addressBreakdown.billstate || addr.addressBreakdown.shipstate) || "",
                mapsTo : "state"
            },
            "country" : {
                value : (addr.addressBreakdown.billcountry || addr.addressBreakdown.shipcountry) || "",
                mapsTo : "country"
            },
            "postal_code_suffix" : {
                value : /* "1304" */"",
                mapsTo : "zip"
            }
        }
        var addrObj = {
            "address": {
                  "addressLines": [
                    // (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1) || "",
                    // //   "12950 RACE TRACK RD",
                    // //   "SUITE 109",
                    // ((addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity) || "") + " " + ((addr.addressBreakdown.billstate || addr.addressBreakdown.shipstate) || "") + " " +  ((addr.addressBreakdown.billzip || addr.addressBreakdown.shipzip) || ""),
                    // (addr.addressBreakdown.billcountry || addr.addressBreakdown.shipcountry) || ""
                  ]
            }
        };

        if((addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1))
        {
            addrObj.address.addressLines.push((addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1))
        }
        if((addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity) || (addr.addressBreakdown.billstate || addr.addressBreakdown.shipstate) || (addr.addressBreakdown.billzip || addr.addressBreakdown.shipzip))
        {
            var prepCityStateZip_result = prepCityStateZip(addr);
            log.debug("prepCityStateZip_result", prepCityStateZip_result)
            if(prepCityStateZip_result)
            {
                addrObj.address.addressLines.push(prepCityStateZip_result)
            }
            
        }
        if((addr.addressBreakdown.billcountry || addr.addressBreakdown.shipcountry))
        {
            addrObj.address.addressLines.push((addr.addressBreakdown.billcountry || addr.addressBreakdown.shipcountry))
        }


        log.debug("validateAddr addrObj", addrObj)
        log.debug("validateAddr origAddrComponents", origAddrComponents)



        var resp = https.post({
            // url : "https://addressvalidation.googleapis.com/v1:validateAddress?key=AIzaSyB8IZSpT9MVoED0xqy22sTASHMPn_7ySYQ",
            url : "https://addressvalidation.googleapis.com/v1:validateAddress?key=AIzaSyDHHq7ZCB35qUFylSSBLvKJVxNbNnSWBCg",
            body : JSON.stringify(addrObj)
        })

        log.debug("validateAddr resp", resp)
        log.debug("validateAddr resp.body", resp.body)

        var respBody = JSON.parse(resp.body);

        for(var key in respBody)
        {
            log.debug("comp0 respBody " + key, respBody[key]);
            if(typeof respBody[key] == "object")
            {
                for(var key1 in respBody[key])
                {
                    log.debug("comp1 respBody " + key + "." + key1, respBody[key][key1]);
                    if(typeof respBody[key][key1] == "object")
                    {
                        for(var key2 in respBody[key][key1])
                        {
                            log.debug("comp2 respBody " + key + "." + key1 + "." + key2, respBody[key][key1][key2]);
                        }
                    }
                }
            }
            
        }

        log.debug("respBody.result.address.addressComponents", respBody.result.address.addressComponents);
        if(respBody.result.address.addressComponents)
        {
            respBody.result.address.addressComponents.every(elem => {
                log.debug("eval addressComponents.elem", elem)
                log.debug("eval addressComponents.elem origAddrComponents[elem.componentType]", origAddrComponents[elem.componentType])
                if(origAddrComponents[elem.componentType])
                {
                    origAddrComponents[elem.componentType].newValue = elem["componentName"]["text"];

                    if(!origAddrComponents[elem.componentType].doIgnore)
                    {
                        if(elem.confirmationLevel != "CONFIRMED" && elem.confirmationLevel != "UNCONFIRMED_BUT_PLAUSIBLE")
                        {
                            functionResult.hasIssues = true;
                        }
                        
                    }
                }
                //be strict on postal_code
                if(elem.componentType == "postal_code")
                {
                    if(elem.confirmationLevel != "CONFIRMED")
                    {
                        functionResult.hasIssues = true;
                    }
                }
                return true;
            })
        }

        
        var newAddr1 = "";
        //a different kind of validation, UNITEDSCI said they are happy with the output, but want to additionally be strict about the ADDR1
        //it could be worth exploring if we can everyting off on uspsData, but we have not spent enough time to explore this part, in other words we dont 100% know what it always mean
        if(respBody.result.uspsData && respBody.result.uspsData.standardizedAddress && respBody.result.uspsData.standardizedAddress.firstAddressLine)
        {
            //be loose on character casing
            if(respBody.result.uspsData.standardizedAddress.firstAddressLine.toUpperCase() != (addr.addressBreakdown.billaddress1 || addr.addressBreakdown.shipaddress1).toUpperCase())
            // if(respBody.result.uspsData.standardizedAddress.firstAddressLine != addr.addressBreakdown.billaddress1)
            {
				//COS : ROD 11152023
				//Prabodh requested that 
                //functionResult.hasIssues = true;
            }
			
			//COS ROD : 11142023
			//still flag it for review because the script made a drastic change
			//but correct address1 from USPS info
			//COS : ROD 11152023 because Prabodh is impressed with USPS response, then lets just always follow its address1 if it have a value
			newAddr1 = respBody.result.uspsData.standardizedAddress.firstAddressLine;
        }
        else{
			//if USPD claims there there's no uspsData, standardizedAddress, or firstAddressLine
			//then it's an issue
			functionResult.hasIssues = true;
        }

        log.debug("validateAddr origAddrComponents with new", origAddrComponents);
        

        var newAddress = [];
        if(addr.addressBreakdown)
        {
            //these are difficult to validate, so just keep the original
            newAddress.push({fieldId : "addressee", value:addr.addressBreakdown.billaddressee || addr.addressBreakdown.shipaddressee});
            newAddress.push({fieldId : "attention", value:addr.addressBreakdown.billattention || addr.addressBreakdown.shipattention});
            newAddress.push({fieldId : "phone", value:addr.addressBreakdown.billphone || addr.addressBreakdown.shipphone});
            newAddress.push({fieldId : "addr2", value:addr.addressBreakdown.billaddr2 || addr.addressBreakdown.shipaddr2});
            newAddress.push({fieldId : "addr3", value:addr.addressBreakdown.billaddr3 || addr.addressBreakdown.shipaddr3});
        }
        newAddress.push({fieldId : "country", value:origAddrComponents.country.newValue});
        newAddress.push({fieldId : "state", value:origAddrComponents.administrative_area_level_1.newValue}); //state
        //zip
        // newAddress.push({fieldId : "zip", value:origAddrComponents.postalCode.newValue + (origAddrComponents.postal_code_suffix.newValue ? ("-"+origAddrComponents.postal_code_suffix.newValue) : "")});
        newAddress.push({fieldId : "zip", value:origAddrComponents.postal_code.newValue + (origAddrComponents.postal_code_suffix.newValue ? ("-"+origAddrComponents.postal_code_suffix.newValue) : "")});
        //addr1
        // newAddress.push({fieldId : "addr1", value:(((origAddrComponents.point_of_interest.newValue || "") + ", ") + ((origAddrComponents.street_number.newValue || "") + " ") + origAddrComponents.route.newValue + ", " + (origAddrComponents.subpremise.newValue || ""))});

		//comment added 11152023 - if newAddr1 still empty, then build it from address components
      if(!newAddr1)
      {
        if(newAddr1)
        {
            newAddr1 += ", ";
        }
        if(origAddrComponents.point_of_interest.newValue)
        {
            newAddr1 += (origAddrComponents.point_of_interest.newValue || "");
        }
        if(newAddr1)
        {
            newAddr1 += " ";
        }
        if(origAddrComponents.street_number.newValue)
        {
            newAddr1 += (origAddrComponents.street_number.newValue || "");
        }
        if(newAddr1)
        {
            newAddr1 += " ";
        }
        if(origAddrComponents.route.newValue)
        {
            newAddr1 += (origAddrComponents.route.newValue || "");
        }
        if(newAddr1)
        {
            newAddr1 += " ";
        }
        if(origAddrComponents.subpremise.newValue)
        {
            newAddr1 += (origAddrComponents.subpremise.newValue || "");
        }
      }
        
        
        newAddress.push({fieldId : "addr1", value:newAddr1});
        newAddress.push({fieldId : "city", value:origAddrComponents.locality.newValue}); //city
        // newAddress.push();
        // newAddress.push(origAddrComponents.country.newValue);

        log.debug("newAddress", newAddress);

        log.debug("validateAddr resp.body", resp.body);
        functionResult.origAddress = addr;
        functionResult.newAddress = newAddress;
        functionResult.respBody_result = respBody.result.address;
        functionResult.uspsData = respBody.result.uspsData;
        return functionResult;
    }

    function prepCityStateZip(addr)
    {
        var prepCityStateZip_result = "";

        if(addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity)
        {
            if(prepCityStateZip_result)
            {
                prepCityStateZip_result += " ";
            }
            prepCityStateZip_result += addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity;
        }

        if(addr.addressBreakdown.billcity || addr.addressBreakdown.shipcity)
        {
            if(prepCityStateZip_result)
            {
                prepCityStateZip_result += " ";
            }
            prepCityStateZip_result += addr.addressBreakdown.billstate || addr.addressBreakdown.shipstate;
        }

        if(addr.addressBreakdown.billzip || addr.addressBreakdown.shipzip)
        {
            if(prepCityStateZip_result)
            {
                prepCityStateZip_result += " ";
            }
            prepCityStateZip_result += addr.addressBreakdown.billzip || addr.addressBreakdown.shipzip;
        }

        return prepCityStateZip_result;
    }
    
    return {
        // beforeLoad: beforeLoad,
        afterSubmit : afterSubmit
    };
    
});
