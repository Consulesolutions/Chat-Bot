/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

/**
 * for UNITED SCIENTIFIC
 *  
 CONSUMER KEY / CLIENT ID
4e4e9d97518e2ca6b7ec3784b4e99aaba0c29f6cbe8fa76aa06f83fa5482734e
CONSUMER SECRET / CLIENT SECRET
0073dc179755104937922dc7f5d9a04cbd33dab50a4ec608a9caa7fbceaaad0d

TOKEN ID
3bf7f9c2daa7ce9ff5bb8874170b666a4e4559590ce527fab3a5686c7e8babf2
TOKEN SECRET
05a020ee0f8d0c2afa6b63440ecd187ff00415529661cc580799892ae262ce50
 */
define(['N/query', 'N/search', 'N/runtime', 'N/format'],
/**
 * @param {query} query
 */
function(query, search, runtime, format) {
   
    
    var currentDate = new Date();
    var excludeWeekendsInShipDate = true;
    var respectTransactionExpectedDates = false;
    var allowDuplicateItems = true;

    var startTime = new Date().getTime();
    /**
     * GET METHOD
     *
     * @since 2015.1
     */
    function get(scriptContext)
    {
        log.debug({scriptContext}, {scriptContext})
        
        log.debug("currentDate", currentDate)
        var payload = scriptContext;
        log.debug(payload);
        var resp = retrieveData(payload);
        return resp;
    }

    function post(scriptContext)
    {
        log.debug("currentDate raw", currentDate)
        var formattedDate = format.format({
            value : currentDate,
            type : format.Type.DATETIMETZ,
            timezone : format.Timezone.AMERICA_CHICAGO
        })


        log.debug("currentDate after n/format", formattedDate)

        // log.debug("{scriptContext}", {scriptContext})
        var payload = scriptContext;
        log.debug(payload);
        var resp = retrieveData(payload);

        var endTime = new Date().getTime();
        log.debug("total runtime in ms:" + (endTime - startTime), scriptContext);

        return resp;
    }

    function getAdditionalFiltersText(itemElems){
        var additionalFiltersObj = {};
        var additionalFiltersText = "";
        var additionalFiltersArray = [];
        var additionalFiltersSr = "";

        if(itemElems)
        {
            // additionalFiltersText += "AND "
            additionalFiltersText += "("
        }
        if(typeof itemElems == "object")
        {
            if(itemElems && itemElems.length > 0)
            {
                itemElems.forEach(itemElem => {
                    additionalFiltersText += "i.itemid = '" + itemElem.itemNumber + "'";
                    additionalFiltersText += " ";
                    additionalFiltersText += "OR ";

                    additionalFiltersArray.push(''+itemElem.itemNumber)
                    additionalFiltersSr += "'"+ itemElem.itemNumber + "',"
                })
            }
        }
        else
        {
            if(itemElems && itemElems.length > 0){
                additionalFiltersText += "i.item = " + itemElems.itemNumber;
                additionalFiltersArray.push("'"+ itemElem.itemNumber + "'")
                additionalFiltersSr += "'"+ itemElem.itemNumber + "',"
            }
        }
        if(itemElems)
        {
            additionalFiltersText = additionalFiltersText.substring(0, additionalFiltersText.lastIndexOf("OR "))
            additionalFiltersText += ")"
        }

        log.debug("additionalFiltersSr0", additionalFiltersSr);
        additionalFiltersSr = additionalFiltersSr.substring(0, [additionalFiltersSr.length - 1])
        // if(additionalFiltersArray && additionalFiltersArray.length > 0)
        // {
        //     additionalFiltersSr = additionalFiltersArray.join(',');
        // }

        log.debug("additionalFiltersArray", additionalFiltersArray);
        log.debug("additionalFiltersText", additionalFiltersText);
        log.debug("additionalFiltersSr", additionalFiltersSr);
        additionalFiltersObj.additionalFiltersText = additionalFiltersText;
        additionalFiltersObj.additionalFiltersSr = additionalFiltersSr;
        return additionalFiltersObj;
    }

    var getResults = function getResults(set) {
		var holder = [];
		var i = 0;
		while (true) {
		var result = set.getRange({
			start: i,
			end: i + 1000
		});
		if (!result) break;
		holder = holder.concat(result);
		if (result.length < 1000) break;
		i += 1000;
		}
		return holder;
	};

    function isCutoffPassed()
    {
        var cutoffPassed = false;
        var scriptParam_cutofftime = runtime.getCurrentScript().getParameter({
            name : "custscript_cos_itemstockapi_cutofftime"
        });

        log.debug("isCutoffPassed scriptParam_cutofftime, currentDate", {scriptParam_cutofftime, currentDate});
        if(scriptParam_cutofftime)
        {
            var cutoffTime = scriptParam_cutofftime

            // Get the current date and time
    
            // var cutoffHour = scriptParam_cutofftime || 0;
            // var cutoffMinute = 0 || 0;
            // var cutoffSecond = 0 || 0;
            // // Set the cutoff time
            // cutoffTime = new Date();
            // cutoffTime.setHours(cutoffHour, cutoffMinute, cutoffSecond); // Set the cutoff time to 6:00 PM
    
             // Compare the time portion of the two date-time values
            // if (currentDate.getTime() > cutoffTime.getTime()) {
            if (currentDate.getTime() > cutoffTime.getTime()) {
                cutoffPassed = true;
            } else {
                cutoffPassed = false;
            }
            log.debug("isCutoffPassed currentDate_time vs cutoffTime_time", {cdh:currentDate.getTime(), coh: cutoffTime.getTime()})
            log.debug("isCutoffPassed currDate_hr vs cutoffTime_hr", {cdh:currentDate.getHours() + ':' + currentDate.getMinutes(), coh: cutoffTime.getHours() + ':' + cutoffTime.getMinutes()})
           
        }
        log.debug("cutoffPassed", cutoffPassed)

        return cutoffPassed;
    }

    function adjustShipDateByDays(initialDate, excludeWeekendsInShipDate)
    {
        var initialDate = new Date(initialDate);
        log.debug("adjustShipDateByDays start, initialDate", initialDate);
        var scriptParam_dateadjust = runtime.getCurrentScript().getParameter({
            name : "custscript_cos_itemstockapi_dateadjust"
        });

        log.debug("scriptParam_dateadjust", scriptParam_dateadjust);
        var numberOfDays = scriptParam_dateadjust || 0;
        if(numberOfDays)
        {
            // var addedDays = 0;
            // while(addedDays < numberOfDays)
            // {
            //     initialDate.setDate(initialDate.getDate()+1);
            //     log.debug("date increased", addedDays)
            //     //getDay confirmed int not str/bool
            //     if(initialDate.getDay() !== 6 && initialDate.getDay() !== 0)
            //     {
            //         log.debug("date increased, not a weekend", addedDays)
            //         //if it +1day does NOT fall on a weekend, then it is acceptable, otherwise do not increase addedDays counter
            //         addedDays++;
            //     }
            // }

            var addedDays = 0;
            // log.debug("adjustShipDateByDays initialDate.getDay()", initialDate.getDay())
            // log.debug("adjustShipDateByDays addedDays", addedDays)
            // log.debug("adjustShipDateByDays addedDays > 3", addedDays > 3)
            // log.debug("adjustShipDateByDays (initialDate.getDay() === 6 || initialDate.getDay() === 0)", (initialDate.getDay() === 6 || initialDate.getDay() === 0))
            //week begins at mon0, tues1, wed2, thu3, fri4, sat5, sun6
            //contrary to google chrome console
            while(addedDays < 3 || (excludeWeekendsInShipDate ? (initialDate.getDay() === 6 || initialDate.getDay() === 0) : false))
            {
                initialDate.setDate(initialDate.getDate()+1);
                addedDays++;
                
                log.debug("adjustShipDateByDays date increased initialDate.getDay()", initialDate.getDay())
                log.debug("adjustShipDateByDays date increased", addedDays)
                log.debug("adjustShipDateByDays date increased initialDate", initialDate)
                log.debug("adjustShipDateByDays date increased 6 or 0", (initialDate.getDay() === 6 || initialDate.getDay() === 0))
                log.debug("adjustShipDateByDays add more", addedDays < 3 || (excludeWeekendsInShipDate ? (initialDate.getDay() === 6 || initialDate.getDay() === 0) : false))
            }
        }
        
        log.debug("adjustShipDateByDays end, initialDate", initialDate);
        return initialDate;
    }

    function adjustByAtpLeadTime(initialDate, atpleadtime)
    {
        var initialDate = new Date(initialDate)
        var numberOfDays = atpleadtime || 0;

        if(numberOfDays)
        {
            initialDate.setDate(initialDate.getDate()+numberOfDays);
        }
        
        return initialDate;
    }

    function retrieveData(payload)
    {
        if(!payload)
        {
            payload = {
                "Header":
                {
                    "MessageId":"124324314324132",
                    "Timestamp":"2018-03-22T16:46:19.845-06:00"
                },
                "items":[
                    {
                    "itemNumber":"BG1003-150",
                    "SupplierPartNumber":"BG1003-150_MPN",
                    "Quantity":10,
                    "unitOfMeasure":"EA"
                    },
                    {
                        "itemNumber":"SSFT08-J",
                        "SupplierPartNumber":"SSFT08-J_MPN",
                        "Quantity":10,
                        "unitOfMeasure":"EA"
                    },
                    {
                        "itemNumber":"MASK2-K95",
                        "SupplierPartNumber":"MASK2-K95_MPN",
                        "Quantity":10,
                        "unitOfMeasure":"EA"
                    },
                    {
                        "itemNumber":"GIBBERISH_askjdhkasjhk",
                        "SupplierPartNumber":"GIBBERISH_askjdhkasjhk_123321MPN",
                        "Quantity":10,
                        "unitOfMeasure":"EA"
                    }
                ]
            }
        }
        log.debug(payload, payload)
        
        var responseObj = {
            Header : payload.Header,
            items : [

            ]
        };

        if(payload && (!payload.items || payload.items.length < 0))
        {
            responseObj.message = "Error, no item requested.";
            return responseObj
        }




        var outputData = [];


        // var sql = `
        //     SELECT DISTINCT 
        //     i.itemid, 
        //     CASE WHEN (tl.quantityshiprecv - tl.quantity) < 0 THEN 0 ELSE (tl.quantityshiprecv - tl.quantity) END as qtytobereceived,
        //     tl.expectedreceiptdate 
        //     FROM 
        //     transaction t, transactionline tl, item i, unitsTypeUom uom 
        //     WHERE
        //     (t.recordtype = 'purchaseorder') 
        //     /*AND ROWNUM <= 100 */
        //     AND t.ID = tl.transaction(+) 
        //     AND i.id  = tl.item(+)   
        //     {{additionalfilters}} 
        //     ORDER BY tl.expectedreceiptdate, i.itemid`
        ////already in base unit quantityshiprecv and quantity


        // var sql = `
        // SELECT 
        // i.itemid AS itemid, 
        // i.quantityavailable AS quantityavailable, 
        // i.quantitybackordered AS quantitybackordered, 
        // transactionLine.quantity - transactionLine.quantityshiprecv AS qtytobereceived, 
        // CASE WHEN transactionLine.expectedreceiptdate IS NOT NULL THEN transactionLine.expectedreceiptdate ELSE "TRANSACTION".duedate END AS expectedreceiptdate 
        // FROM 
        // "TRANSACTION", 
        // (SELECT 
        //     item."ID" AS id_join, 
        //     item.itemid AS itemid, 
        //     aggregateItemLocation.quantityavailable AS quantityavailable, 
        //     aggregateItemLocation.quantitybackordered AS quantitybackordered, 
        //     aggregateItemLocation.quantitybackordered AS quantitybackordered_crit
        // FROM 
        //     item, 
        //     aggregateItemLocation
        // WHERE 
        //     item."ID" = aggregateItemLocation.item(+)
        // ) i, 
        // transactionLine
        // WHERE 
        // ((transactionLine.item = i.id_join(+) AND "TRANSACTION"."ID" = transactionLine."TRANSACTION"))
        // AND (("TRANSACTION"."TYPE" IN ('PurchOrd') 
        // {{additionalfilters}} 
        // AND NVL(transactionLine.isclosed, 'F') = 'F' AND transactionLine.quantity - transactionLine.quantityshiprecv > 0 AND i.quantitybackordered_crit > 0))
        // `

        //STABLE 08242023
        // var sql = `
        //     SELECT DISTINCT 
        //     i.itemid, 
        //     CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END as qtytobereceived, 
        //     CASE WHEN (tl.expectedreceiptdate) IS NOT NULL THEN (tl.expectedreceiptdate) ELSE (t.duedate) END as expectedreceiptdate 
        //     FROM 
        //     transaction t, transactionline tl, item i 
        //     WHERE
        //     (t.recordtype = 'purchaseorder') 
        //     /*AND ROWNUM <= 100 */
        //     AND t.ID = tl.transaction(+) 
        //     AND i.id  = tl.item(+) 
        //     AND NVL(tl.isclosed, 'F') = 'F' 
        //     /*AND tl.quantity - tl.quantityshiprecv > 0 */
        //     {{additionalfilters}} 
        //     ORDER BY expectedreceiptdate, i.itemid`


        // var sql = `
        // SELECT DISTINCT 
        // t.ID, i.itemid, inbship.purchaseordertransaction, 
        // CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END as qtytobereceived, 
        // CASE WHEN (tl.expectedreceiptdate) IS NOT NULL THEN (tl.expectedreceiptdate) ELSE (t.duedate) END as expectedreceiptdate 
        // FROM 
        // transaction t, transactionline tl, item i, 
        //     (SELECT 
        //         InboundShipmentItem.purchaseordertransaction 
        //         FROM 
        //         InboundShipment, 
        //         InboundShipmentItem
        //       WHERE 
        //         InboundShipment."ID" = InboundShipmentItem.inboundshipment(+)
        //          AND InboundShipmentItem.purchaseordertransaction IN ('271598') AND InboundShipmentItem.purchaseordertransaction = 271598 ) AS inbship
            
        // WHERE
        // (t.recordtype = 'purchaseorder') 
        // /*AND ROWNUM <= 100 */
        // AND t.ID = tl.transaction(+) 
        // AND i.id  = tl.item(+) 
        // AND NVL(tl.isclosed, 'F') = 'F' 
        // /*AND tl.quantity - tl.quantityshiprecv > 0 */ 
        // AND i.ID IN ('2695')
        // ORDER BY expectedreceiptdate, i.itemid`
    // var sql = `
    //         SELECT DISTINCT 
    //         t.ID, i.itemid, inbship.purchaseordertransaction, 
    //         CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END as qtytobereceived, 
    //         CASE WHEN (tl.expectedreceiptdate) IS NOT NULL THEN (tl.expectedreceiptdate) ELSE (t.duedate) END as expectedreceiptdate 
    //         FROM 
    //         transaction t, transactionline tl, item i, 
    //             (SELECT 
    //                 InboundShipmentItem.purchaseordertransaction 
    //                 FROM 
    //                 InboundShipment, 
    //                 InboundShipmentItem
    //               WHERE 
    //                 InboundShipment."ID" = InboundShipmentItem.inboundshipment(+)
    //                  AND InboundShipmentItem.purchaseordertransaction IN ('271598') AND InboundShipmentItem.purchaseordertransaction = 271598 ) AS inbship
                
    //         WHERE
    //         (t.recordtype = 'purchaseorder') 
    //         /*AND ROWNUM <= 100 */
    //         AND t.ID = tl.transaction(+) 
    //         AND i.id  = tl.item(+) 
    //         AND NVL(tl.isclosed, 'F') = 'F' 
    //         /*AND tl.quantity - tl.quantityshiprecv > 0 */ 
    //         AND i.ID IN ('2695')
    //         ORDER BY expectedreceiptdate, i.itemid`

        var sql = `
            SELECT DISTINCT 
            t.ID, i.itemid,  
            CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END as qtytobereceived, 
            CASE WHEN (ib.expecteddeliverydate) IS NOT NULL THEN ib.expecteddeliverydate ELSE CASE WHEN (tl.expectedreceiptdate) IS NOT NULL THEN (tl.expectedreceiptdate) ELSE (t.duedate) END END as expectedreceiptdate 
            FROM 
            
            item i 
            LEFT JOIN 
            transactionline tl 
            ON i.ID = tl.item AND (CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END) > 0  
            LEFT JOIN 
            transaction t ON 
            t.ID = tl.transaction
            LEFT JOIN 
            InboundShipmentItem ibi 
            ON 
            t.ID = ibi.purchaseordertransaction 
            LEFT JOIN 
            InboundShipment ib 
            ON 
            ibi.inboundshipment = ib.ID 
                
            WHERE 

            {{additionalfilters}} 

            AND 
            NVL(tl.isclosed, 'F') = 'F'  AND 
            (t.recordtype = 'purchaseorder') 
            ORDER BY expectedreceiptdate, i.itemid`

            //1.2.0
        // var sql = `
        //     SELECT DISTINCT 
        //     t.ID, i.itemid, ib.expecteddeliverydate, ibi.inboundshipment, 
        //     CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END as qtytobereceived, 
        //     CASE WHEN (tl.expectedreceiptdate) IS NOT NULL THEN (tl.expectedreceiptdate) ELSE (t.duedate) END as expectedreceiptdate 
        //     FROM 
            
        //     item i 
        //     LEFT JOIN 
        //     transactionline tl 
        //     ON i.ID = tl.item AND (CASE WHEN (tl.quantity - tl.quantityshiprecv) <= 0 THEN 0 ELSE (tl.quantity - tl.quantityshiprecv) END) > 0 
        //     LEFT JOIN 
        //     transaction t ON 
        //     t.ID = tl.transaction 
        //     LEFT JOIN 
        //     InboundShipmentItem ibi 
        //     ON 
        //     t.ID = ibi.purchaseordertransaction 
        //     LEFT JOIN 
        //     InboundShipment ib 
        //     ON 
        //     ibi.inboundshipment = ib.ID 
                
        //     WHERE
        //     (t.recordtype = 'purchaseorder') 
        //     AND NVL(tl.isclosed, 'F') = 'F' 
        //     {{additionalfilters}} 
        //     ORDER BY expectedreceiptdate, i.itemid`

        // var sql = `
        //     SELECT DISTINCT 
        //     tl.item, tl.ID, i.itemid, iiv.quantityAvailable, ail.quantitybackordered,
        //     CASE WHEN (tl.quantityshiprecv - tl.quantity) < 0 THEN 0 ELSE (tl.quantityshiprecv - tl.quantity) END as qtytobereceived, 
        //     tl.expectedreceiptdate 
        //     FROM 
        //     transaction t, transactionline tl, item i, ItemInventoryBalance iiv,  aggregateItemLocation ail 
        //     WHERE
        //     (t.recordtype = 'purchaseorder') 
        //     /*AND ROWNUM <= 100 */
        //     AND t.ID = tl.transaction(+) 
        //     AND i.id  = tl.item(+)
        //     AND iiv.item = i.id(+) 
        //     AND ail.item = i.id(+) 
        //     AND ail.quantitybackordered IS NOT NULL 
        //     {{additionalfilters}} 
        //     ORDER BY tl.expectedreceiptdate, i.itemid`

            // var sql = `
            // SELECT 
            // tl.item, tl.ID, i.itemid, iiv.quantityAvailable, ail.quantitybackordered, (tl.quantitybilled - tl.quantity) as qtytobereceived, tl.expectedreceiptdate 
            // FROM 
            // transaction t, transactionline tl, item i, ItemInventoryBalance iiv,  aggregateItemLocation ail 
            // WHERE
            // (t.recordtype = 'purchaseorder' OR t.recordtype = 'inboundshipment') 
            // AND ROWNUM <= 100 
            // /*AND tl.transaction =  t.ID*/
            // /*AND tl.quantitybilled - tl.quantity > 0*/ 
            // AND tl.item = i.id 
            // AND iiv.item = i.id(+)
            // AND ail.item = i.id(+)
            // /*AND ail.quantitybackordered IS NOT NULL */
            // {{additionalfilters}} 
            // ORDER BY tl.expectedreceiptdate`


        // var sql = `
        //     SELECT 
        //     tl.item, i.itemid, iiv.quantityAvailable, ail.quantitybackordered, (tl.quantitybilled - tl.quantity) as qtytobereceived, tl.expectedreceiptdate 
        //     FROM 
        //     transaction t, transactionline tl, item i, ItemInventoryBalance iiv,  aggregateItemLocation ail 
        //     WHERE
        //     (t.recordtype = 'purchaseorder' OR t.recordtype = 'inboundshipment') 
        //     /*AND ROWNUM <= 100 */
        //     AND t.ID = tl.transaction 
        //     /*AND tl.quantitybilled - tl.quantity > 0*/ 
        //     AND tl.item = i.id 
        //     AND iiv.item = i.id(+) 
        //     AND ail.item = i.id(+) 
        //     AND tl.expectedreceiptdate IS NOT NULL 
        //     {{additionalfilters}} 
        //     ORDER BY tl.expectedreceiptdate`
        
        // var sql = `
        //     SELECT 
        //     tl.item, i.itemid, iiv.quantityAvailable, ail.quantitybackordered, (tl.quantitybilled - tl.quantity) as qtytobereceived, tl.expectedreceiptdate 
        //     FROM 
        //     transaction t, transactionline tl, item i, ItemInventoryBalance iiv,  aggregateItemLocation ail 
        //     WHERE
        //     (t.recordtype = 'purchaseorder' OR t.recordtype = 'inboundshipment') 
        //     AND ROWNUM <= 100 
        //     AND t.ID = tl.transaction 
        //     /*AND tl.quantitybilled - tl.quantity > 0*/ 
        //     AND tl.item = i.id 
        //     AND iiv.item = i.id(+) -
        //     AND ail.item = i.id(+) 
        //     ORDER BY tl.expectedreceiptdate`

            // var sql = `SELECT 
            // tl.item, i.itemid, (tl.quantitybilled - tl.quantity) as qtytobereceived, tl.expectedreceiptdate 
            // FROM 
            // transaction t, transactionline tl, item i
            // WHERE
            // (t.recordtype = 'purchaseorder' OR t.recordtype = 'inboundshipment') 
            // AND ROWNUM <= 100 
            // AND t.ID = tl.transaction AND tl.quantitybilled - tl.quantity > 0 
            // AND tl.item = i.id
            // ORDER BY tl.expectedreceiptdate`

            var additionalFiltersObj = getAdditionalFiltersText(payload.items);
            log.debug("additionalFiltersObj", additionalFiltersObj)
            var additionalFiltersText = additionalFiltersObj.additionalFiltersText;
            log.debug("additionalFiltersText1", additionalFiltersText)
            var additionalFiltersSr = additionalFiltersObj.additionalFiltersSr;
            log.debug("additionalFiltersSr1", additionalFiltersSr)
            sql = sql.replace(`{{additionalfilters}}`, additionalFiltersText || "");

            log.debug("final sql", sql)

            var pagedResults = query.runSuiteQLPaged({
                query: sql,
                pageSize: 1000
            })
        
            pagedResults.iterator().each(function(resultPage) {
                // log.debug("resultPage", resultPage)
                outputData = outputData.concat(resultPage.value.data.asMappedResults());
                return true;
            });

            //08242023 just reuse the filter
            // var itemNames = [];
            // var itemNamesFilter = [];
            // if(outputData && outputData.length > 0)
            // {
            //     outputData.forEach(res => {
            //         if(itemNames.indexOf(res.itemid) == -1){
            //             itemNames.push(res.itemid)
            //         }
            //     })
            // }

            // itemNames.forEach(itemName => {
            //     itemNamesFilter.push(["itemid", "is", itemName]);
            //     itemNamesFilter.push("OR");
            // })
            // itemNamesFilter.pop();

            // log.debug("itemNamesFilter", itemNamesFilter);

            var itemNamesFilter = [["formulanumeric: CASE WHEN {itemid} IN (" + additionalFiltersSr + ") THEN 1 ELSE 0 END","equalto","1"]];

            log.debug("itemNamesFilter", itemNamesFilter)
            var searchObj = search.create({
                type : "item",
                filters : itemNamesFilter,
                columns : [
                    search.createColumn({
                        name : "quantityavailable",
                        summary: "MAX",
                        label: "quantityavailable"
                    }),
                    search.createColumn({
                        name : "quantitybackordered",
                        summary: "MAX",
                        label: "quantitybackordered"
                    }),
                    search.createColumn({
                        name : "itemid",
                        summary: "GROUP",
                        label: "itemid"
                    }),
                    search.createColumn({
                        name : "stockunit",
                        summary: "GROUP",
                        label: "stockunit"
                    }),
                    search.createColumn({
                        name : "saleunit",
                        summary: "GROUP",
                        label: "saleunit"
                    }),
                    search.createColumn({
                        name: "locationatpleadtime",
                        summary: "MAX",
                        label: "atpleadtime"
                    })
                ]
            });

            var sr = getResults(searchObj.run());
        
            // var resultSet = projectQuery.run();
            // // var resultSet = projectQuery.run();
            // for (var i = 0; i < resultSet.results.length; i++) {
            //     var mResult = resultSet.results[i].asMap();
            //     // inputData.findIndex(elem => elem.parent == mResult.parent);
            //     inputData.push(mResult);
            //     log.debug(mResult);
            // }
            // log.debug("resultSet", resultSet)


        log.debug("getInputData outputData", outputData)
        // return outputData;
        // return "TEST" + new Date().getTime();

        if(payload.items)
        {
            payload.items.forEach((elem) => {

                var filteredByItem = outputData.filter(row_elem => row_elem.itemid == elem.itemNumber);
                //remove the lines that are already processed, NOTE:this is not suited for multiple payload items that refers to the same items
                if(!allowDuplicateItems)
                {
                    outputData = outputData.filter(row_elem => row_elem.itemid != elem.itemNumber);
                    //do not update outputDate, will support multi line vs same item - this will be slower though
                }

                log.debug("filteredByItem " + elem.itemNumber, filteredByItem);
    
                //because sql query only deals with transactional data, this does mean that the item is invalid
                // if(!filteredByItem || filteredByItem.length == 0)
                // {
                //     // elem["status"] = `ERROR`;
                //     // elem["OtherInfo"] = `item not found`;
                //     // return;
                // }

                var quantityAvailable = 0;
                var quantityBackordered = 0;
                var stockUnitText = "";
                var stockUnitConversionRate = 1;
                var saleUnitText = "";
                var saleUnitConversionRate = 1;
                var atpleadtime = 0;
                
                
                var requestedQty = Number(elem.Quantity || 0 );
                var origRequestedQty = requestedQty;

                var srFiltered = sr.filter(res => {
                    log.debug("getting item qtys, res", res)
                    var res_itemId = res.getValue({
                        name : "itemid",
                        summary: "GROUP",
                    });
                    if(res_itemId == elem.itemNumber)
                    {
                        quantityAvailable = Number(res.getValue({
                            name : "quantityavailable",
                            summary: "MAX",
                        }) || 0);
                        quantityBackordered = Number(res.getValue( {
                            name : "quantitybackordered",
                            summary: "MAX",
                        }) || 0);

                        atpleadtime = Number(res.getValue({
                            name: "locationatpleadtime",
                            summary: "MAX",
                        }) || 0);

                        stockUnitText = res.getText( {
                            name : "stockunit",
                            summary: "GROUP",
                        }) || "";
                        saleUnitText = res.getText( {
                            name : "saleunit",
                            summary: "GROUP",
                        }) || "";
                        log.debug("stockUnitText for item " + res_itemId, stockUnitText);
                        if(stockUnitText)
                        {
                            var lastIndexOfSpace = stockUnitText.lastIndexOf(" ");
                            if(lastIndexOfSpace != -1)
                            {
                                stockUnitConversionRate = stockUnitText.substring(lastIndexOfSpace+1);

                                log.debug("stockUnitConversionRate via lastNum for item " + res_itemId, stockUnitConversionRate);
                                if(stockUnitConversionRate && !isNaN(stockUnitConversionRate))
                                {
                                    quantityBackordered = quantityBackordered * stockUnitConversionRate;
                                    quantityAvailable = quantityAvailable * stockUnitConversionRate;
                                }
                                else
                                {
                                    stockUnitConversionRate = stockUnitText.substring(0, firstIndexOfSpace);
                                    if(isNaN(stockUnitConversionRate))
                                    {
                                        stockUnitConversionRate = 1;
                                    }
                                    quantityBackordered = quantityBackordered * stockUnitConversionRate;
                                    quantityAvailable = quantityAvailable * stockUnitConversionRate;
                                }
                            }

                            if(isNaN(stockUnitConversionRate))
                            {
                                var firstIndexOfSpace = stockUnitText.indexOf(" ");
                                if(firstIndexOfSpace != -1)
                                {
                                    stockUnitConversionRate = stockUnitText.substring(firstIndexOfSpace+1);

                                    log.debug("stockUnitConversionRate via firstNum for item " + res_itemId, stockUnitConversionRate);
                                    if(stockUnitConversionRate && !isNaN(stockUnitConversionRate))
                                    {
                                        
                                        quantityBackordered = quantityBackordered * stockUnitConversionRate;
                                        quantityAvailable = quantityAvailable * stockUnitConversionRate;
                                    }
                                }
                                else
                                {
                                    stockUnitConversionRate = stockUnitText.substring(0, firstIndexOfSpace);
                                    if(isNaN(stockUnitConversionRate))
                                    {
                                        stockUnitConversionRate = 1;
                                    }
                                    quantityBackordered = quantityBackordered * stockUnitConversionRate;
                                    quantityAvailable = quantityAvailable * stockUnitConversionRate;
                                }
                            }
                             
                        }
                        //refactor for saleunit
                        if(saleUnitText)
                        {
                            var lastIndexOfSpace = saleUnitText.lastIndexOf(" ");
                            if(lastIndexOfSpace != -1)
                            {
                                saleUnitConversionRate = saleUnitText.substring(lastIndexOfSpace+1);

                                log.debug("saleUnitConversionRate via lastNum for item " + res_itemId, saleUnitConversionRate);
                                if(saleUnitConversionRate && !isNaN(saleUnitConversionRate))
                                {
                                    requestedQty = requestedQty * saleUnitConversionRate;
                                }
                                else
                                {
                                    saleUnitConversionRate = saleUnitText.substring(0, firstIndexOfSpace);
                                    if(isNaN(saleUnitConversionRate))
                                    {
                                        saleUnitConversionRate = 1;
                                    }
                                    requestedQty = requestedQty * saleUnitConversionRate;
                                }
                            }

                            if(isNaN(saleUnitConversionRate))
                            {
                                var firstIndexOfSpace = saleUnitText.indexOf(" ");
                                if(firstIndexOfSpace != -1)
                                {
                                    saleUnitConversionRate = saleUnitText.substring(firstIndexOfSpace+1);

                                    log.debug("saleUnitConversionRate via firstNum for item " + res_itemId, saleUnitConversionRate);
                                    if(saleUnitConversionRate && !isNaN(saleUnitConversionRate))
                                    {
                                        requestedQty = requestedQty * saleUnitConversionRate;
                                    }
                                }
                                else
                                {
                                    saleUnitConversionRate = saleUnitText.substring(0, firstIndexOfSpace);
                                    if(isNaN(saleUnitConversionRate))
                                    {
                                        saleUnitConversionRate = 1;
                                    }
                                    requestedQty = requestedQty * saleUnitConversionRate;
                                }
                                
                            }
                             
                        }
                        return true;
                    }

                    // log.debug({res_itemId, quantityAvailable, quantityBackordered})
                })

                if(!srFiltered || srFiltered.length == 0)
                {
                    elem["status"] = `ERROR`;
                    elem["OtherInfo"] = `item not found`;
                    return;
                }

                // if(filteredByItem && filteredByItem.length > 0)
                // {
                    elem.QuantityAvailable = quantityAvailable || 0;
                    elem.QuantityBackordered = quantityBackordered || 0;
                // }
    
                // var quantityRemaining = quantityAvailable - requestedQty;
                //08242023 you can never have qtyavailable if you have backordered
                //backorder is caused by SO or transaction being recorded that needs stock - related commitments
                //this is good because if 5 is requested, backordered is 25, those 25qty should be allocated to existing orders
                //meaning none will be left for new orders-which could be the site visitor checking for availability
                //this assume the site visitor is there to check dates for new orders, not their existing ones
                var quantityNeeded = (requestedQty || 0) + quantityBackordered - quantityAvailable; 
                // var quantityNeeded = (requestedQty || 0);
                // var nearestexpectedreceiptdate = "No/Insufficient incoming stocks";
                var nearestexpectedreceiptdate = "";

                var total_qtytobereceived = filteredByItem.reduce((sum, row_elem) => {
                    return sum + row_elem.qtytobereceived;
                }, 0)

                //if zero is requested, this is a weird case, but we can say 0 is available now, since nothing needs to be commited for it
                //so even if it is backordered it is practical to tell the site visitor that 0qty is available
                //this is weird case, may not even happen from the frontend
                if(!quantityNeeded || quantityNeeded < 0)
                {
                    nearestexpectedreceiptdate = currentDate;
                    shipDate = currentDate;
                    elem["status"] = `OK`;
                }
                //08242023 //but what if there is no backordered at all, this is the time that means it is readily available
                //note that multiple visitors will have a conflict cause chekcing qty does not mean its been allocated
                //100 visitors check the item for 1qty, without placing an order means nothing is commited
                //if 1 is available, response will say, yes its currently available to all the 100 requestor
                //if any of them does place an order and is allocated
                //the available quantity would have changed for the other requestor, yet they were all informed 1 is currently available
                else if (quantityAvailable >= requestedQty)
                {
                    shipDate = currentDate;
                    elem["status"] = `OK`;
                }
                else if(total_qtytobereceived >= quantityNeeded) //it can be fulfilled in the future
                {
                    var sum = 0;
                    filteredByItem.every((row_elem) => {
                        if(row_elem.qtytobereceived)
                        {
                            if(sum < quantityNeeded && row_elem.expectedreceiptdate)
                            {
                                nearestexpectedreceiptdate = row_elem.expectedreceiptdate;
                                nearestexpectedreceiptdate = new Date(nearestexpectedreceiptdate);
                                sum += row_elem.qtytobereceived;
                            }

                            if(sum >= quantityNeeded)
                            {
                                return false;
                            }
                        }
                        return true;
                    })

                    elem["status"] = `OK`;
                    elem["BackorderShipDate"] = nearestexpectedreceiptdate;
                    //08242023 in the case that backorder is enough but cant resolve date

                    //if backordershipdate cant be resolved, responding that it's never available is disadvantageous to sales, just say its available in 90/atp days
                    if(!elem["BackorderShipDate"])
                    {
                        elem["BackorderShipDate"] = adjustByAtpLeadTime(currentDate, 90);
                        elem["OtherInfo"] = `Sufficient incoming stocks, but date is not resolved`;
                    }
                }
                else
                {
                    //if backordershipdate cant be resolved, responding that it's never available is disadvantageous to sales, just say its available in 90/atp days
                    elem["BackorderShipDate"] = adjustByAtpLeadTime(currentDate, 90);

                    elem["status"] = `OK`;
                    elem["OtherInfo"] = `No/Insufficient incoming stocks, stocks will come in via default ATP (90)days`;
                }

                
                log.debug("RAW qtys for item " + elem.itemNumber, {atpleadtime, total_qtytobereceived, quantityNeeded, origRequestedQty, requestedQty, quantityBackordered, quantityAvailable, nearestexpectedreceiptdate})
                
                elem["TotalReceivableQuantity"] = total_qtytobereceived;
                
                //08242023 at this point, shipdate is either today, or blank if requestedqty is not available

                //08242023 but if it is incoming soon
                //shipdate will be based on today - if expected receipt date says it should have been received today or earlier
                //or it will be based on the future expected receipt date
                //or shipdate will be +90days
                if(nearestexpectedreceiptdate && nearestexpectedreceiptdate != "No/Insufficient incoming stocks")
                {
                    //if it already passed, then use today, shipper and concerned parties needs to prepare, otherwise lead time going to get messed up
                    //this is the case of outstanding POs that did not get received per defined estimated date
                    if(nearestexpectedreceiptdate < currentDate)
                    {
                        nearestexpectedreceiptdate = currentDate;
                    }
                    shipDate = new Date(nearestexpectedreceiptdate);
                    log.debug("change nearestexpectedreceiptdate for " + elem.itemNumber, {nearestexpectedreceiptdate, currentDate})
                }
                else{
                    shipDate = adjustByAtpLeadTime(currentDate, 90);
                }

                //08242023 - if you have a shipdate, this will be always, because +90days will just apply if not resolved from transactions
                //always apply cutoff time
                //this should happen before you do the +3days except weekends rule
                if(shipDate)
                {
                    //compute shipDate here
                    if(isCutoffPassed())
                    {
                        shipDate = shipDate.setDate(shipDate.getDate()+1);
                        // shipDate = shipDate.setDate(ms)
                    }
                }

                elem.QuantityRequested = elem.Quantity;
                elem.QuantityRequestedInBU = requestedQty;

                //apply the +3 days now, except weekends, the date adjustment is controlled by script param
                if(shipDate)
                {
                    shipDate = adjustShipDateByDays(shipDate, excludeWeekendsInShipDate);
                }
                //08242023
                //at this point, shipdate is computed independently vs backordered shipdate, factoring +90atp, and cutoff time
                //also, backordered date is computed independently, factoring +90atp, NO CUTOFFTIME is applied to backordered date
                //because backordered date would simply reflect when UNITED SCI will get the item, meaning it excludes the time UNITED SCI can ship it to customer
                
                elem.ShipDate = shipDate;

                //if backordershipdate cant be resolved, then dont include this attribute
                if(!elem.BackorderShipDate || elem.BackorderShipDate == null || elem.BackorderShipDate == "null")
                {
                    delete elem.BackorderShipDate;
                }

                log.debug("FINAL qtys for item " + elem.itemNumber, {atpleadtime, total_qtytobereceived, quantityNeeded, origRequestedQty, requestedQty, quantityBackordered, quantityAvailable, nearestexpectedreceiptdate})
                
                
                delete elem["Quantity"];
                // delete payload.items[index]["Quantity"];
            })
        }
        

        responseObj.items = payload.items;

        return JSON.stringify(responseObj)
        return JSON.stringify(outputData)
        
        // return outputData;
    }
    
    

    

    return {
        get: get,
        post: post,
    };
    
});

//item table
//SELECT * FROM ITEM WHERE rownum <= 1
// [
//     {
//       "totalquantityonhand": 0,
//       "copydescription": "F",
//       "prodqtyvarianceacct": null,
//       "purchaseunit": 12,
//       "weightunits": "per EA",
//       "rescheduleindays": null,
//       "averagecost": null,
//       "featureddescription": null,
//       "nextagproductfeed": "F",
//       "shipindividually": "F",
//       "createexpenseplanson": null,
//       "periodiclotsizetype": null,
//       "costestimate": null,
//       "countryofmanufacture": "DE",
//       "storedisplaythumbnail": null,
//       "isspecialorderitem": "F",
//       "receiptquantitydiff": null,
//       "dropshipexpenseaccount": null,
//       "stockunit": 12,
//       "saleunit": 12,
//       "expenseaccount": 805,
//       "purchasepricevarianceacct": null,
//       "shopzillacategoryid": null,
//       "supplytimefence": null,
//       "isserialitem": "F",
//       "isfulfillable": "T",
//       "generateaccruals": "T",
//       "weightunit": null,
//       "storedisplayname": null,
//       "expenseamortizationrule": null,
//       "description": "Temp Sensor 3870/5075 Elv-D, Lab Line, HSG",
//       "itemid": "023290002",
//       "class": null,
//       "intercoexpenseaccount": null,
//       "lastpurchaseprice": 310.63,
//       "nextagcategory": null,
//       "costcategory": 6,
//       "subtype": null,
//       "purchaseorderquantity": null,
//       "billqtyvarianceacct": null,
//       "isphantom": "F",
//       "rescheduleoutdays": null,
//       "id": 7963,
//       "custreturnvarianceaccount": null,
//       "seasonaldemand": "T",
//       "consumptionunit": 12,
//       "usebins": "T",
//       "costestimatetype": "LASTPURCHPRICE",
//       "weight": null,
//       "handlingcost": null,
//       "mpn": null,
//       "billingschedule": null,
//       "deferralaccount": null,
//       "planningitemcategory": null,
//       "alternatedemandsourceitem": null,
//       "displayname": "Temp Sensor 3870/5075 Elv-D, Lab Line, HSG",
//       "purchaseorderquantitydiff": null,
//       "vendreturnvarianceaccount": null,
//       "matrixtype": null,
//       "storedescription": null,
//       "enforceminqtyinternally": "T",
//       "isspecialworkorderitem": null,
//       "custitem_supply_allocation_count": 0,
//       "parent": null,
//       "supplytype": null,
//       "quantitypricingschedule": null,
//       "createddate": "12/20/2022",
//       "fxcost": 310.83,
//       "froogleproductfeed": "F",
//       "billexchratevarianceacct": null,
//       "periodiclotsizedays": null,
//       "supplyreplenishmentmethod": "REORDER_POINT",
//       "manufacturer": null,
//       "isonline": "F",
//       "demandtimefence": null,
//       "unbuildvarianceaccount": null,
//       "overallquantitypricingtype": null,
//       "demandmodifier": null,
//       "stockdescription": "Temp Sensor 3870/5075",
//       "overheadtype": null,
//       "printitems": "F",
//       "tracklandedcost": "T",
//       "excludefromsitemap": "F",
//       "wipvarianceacct": null,
//       "gainlossaccount": null,
//       "storedisplayimage": null,
//       "custitem_supply_planning_count": 0,
//       "pricinggroup": null,
//       "preferredlocation": 4,
//       "custitem4": null,
//       "forwardconsumptiondays": null,
//       "custitem3": null,
//       "custitem5": null,
//       "supplylotsizingmethod": null,
//       "custitem2": null,
//       "isdropshipitem": "F",
//       "custitem1": null,
//       "billpricevarianceacct": null,
//       "wipacct": null,
//       "matchbilltoreceipt": "T",
//       "location": 4,
//       "vendorname": null,
//       "shippackage": null,
//       "prodpricevarianceacct": null,
//       "incomeaccount": 803,
//       "residual": null,
//       "atpmethod": "CUMULATIVE_ATP_WITH_LOOK_AHEAD",
//       "searchkeywords": null,
//       "purchaseorderamount": null,
//       "minimumquantity": null,
//       "receiptquantity": null,
//       "scrapacct": null,
//       "transferprice": null,
//       "assetaccount": 731,
//       "unitstype": 7,
//       "storedetaileddescription": null,
//       "custitem_order_delay_count": 0,
//       "cost": 310.83,
//       "costingmethod": "FIFO",
//       "lastmodifieddate": "05/10/2023",
//       "yahooproductfeed": "F",
//       "backwardconsumptiondays": null,
//       "upccode": null,
//       "islotitem": "F",
//       "includechildren": "T",
//       "subsidiary": "1",
//       "sitemappriority": null,
//       "itemtype": "InvtPart",
//       "receiptamount": null,
//       "shopzillaproductfeed": "F",
//       "fullname": "023290002",
//       "buildentireassembly": null,
//       "usemarginalrates": "F",
//       "relateditemsdescription": null,
//       "metataghtml": null,
//       "shippingcost": null,
//       "shoppingdotcomcategory": null,
//       "roundupascomponent": "F",
//       "amortizationtemplate": null,
//       "isinactive": "F",
//       "purchasedescription": "Temp Sensor 3870/5075 Elv-D, Lab Line, HSG",
//       "intercoincomeaccount": null,
//       "shoppingproductfeed": "F",
//       "fixedlotsize": null,
//       "costingmethoddisplay": "FIFO",
//       "custitem_sps_item_synch": "F",
//       "externalid": null,
//       "matrixitemnametemplate": null,
//       "maximumquantity": null,
//       "amortizationperiod": null,
//       "totalvalue": 0,
//       "department": null
//     }
//   ]
