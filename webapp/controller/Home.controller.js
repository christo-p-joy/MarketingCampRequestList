sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "zcrmktmarketingreqlist/marketingcampaignreqlist/utils/formatter",
],
function (Controller, formatter) {
    "use strict";

    return Controller.extend("zcrmktmarketingreqlist.marketingcampaignreqlist.controller.Home", {
        formatter: formatter,
                onInit: function () {
                    const oOwnComp = this.getOwnerComponent();
                    const oModel = oOwnComp.getModel();
                    const oFilterMdoel = oOwnComp.getModel("filterModel");
                    let oView = this.getView();
                    oView.setBusy(true);
                    
                    let sUrl = "/UserSet('')";
                    // Fetching the user role to determine visibility of filters
                    oModel.read(sUrl, {
                        success: function (oData) {
                            if (oData.Role === "Approver") {
                                oFilterMdoel.setProperty("/visible", true);
                            } else if (oData.Role === "Marketing")
                                oFilterMdoel.setProperty("/visible", false);
                            oView.setBusy(false);
                        },
                        error: function (oError) {
                            oView.setBusy(false);
                        },
                    });
                },
                
                onBeforeRebind(oEvent) {
                    const oStatusComboBox = this.byId("requestStatus");
                    const oPermitTypeComboBox = this.byId("permitType");

                    const sStatusKey = oStatusComboBox.getSelectedKey();
                    const sPermitTypeKey = oPermitTypeComboBox.getSelectedKey();
                    
                    const oBindingParams = oEvent.getParameter("bindingParams");
                    // Adding select parameters to the binding as we are manually setting the filters in
                    oBindingParams.parameters.select += ",InitiatedDate,Status,PermitType,RequestId";

                    const oModel = this.getView().getModel("filterModel");
                    const oData = oModel.getData();
                    const aData = Object.entries(oData);

                    // loop through the filter data and adding filters to the binding parameters

                    aData.forEach((element) => {
                        if (element[1])
                            switch (element[0]) {
                                case "Status":
                                    oBindingParams.filters.push(
                                        new sap.ui.model.Filter(
                                            "Status",
                                            sap.ui.model.FilterOperator.EQ,
                                            sStatusKey
                                        )
                                    );
                                    break;
                                case "RequesterId":
                                    oBindingParams.filters.push(
                                        new sap.ui.model.Filter(
                                            "CreatedBy",
                                            sap.ui.model.FilterOperator.Contains,
                                            element[1]
                                        )
                                    );

                                    break;
                                case "RequestId":
                                    oBindingParams.filters.push(
                                        new sap.ui.model.Filter(
                                            "RequestId",
                                            sap.ui.model.FilterOperator.EQ,
                                            element[1]
                                        )
                                    );
                                    break;
                                case "InitiatedDate":
                                    var dateRange = element[1].split(" - ");

                                    /**
                                     * Used for parsing the date and adjusting it to the local timezone
                                     * @param {*} dateStr 
                                     * @returns parsed date object
                                     */

                                    function parseAndAdjustDate(dateStr) {
                                        var date = new Date(dateStr);
                                        date.setDate(date.getDate()); 
                                        return date;
                                    }

                                    var fromDate = parseAndAdjustDate(
                                        dateRange[0]
                                    );
                                    var toDate = parseAndAdjustDate(
                                        dateRange[1]
                                    );

                                    fromDate.setHours(0, 0, 0, 0);
                                    toDate.setHours(23, 59, 59, 999);

                                    if (dateRange[0] === dateRange[1]) {
                                        oBindingParams.filters.push(new sap.ui.model.Filter("InitiatedDate", sap.ui.model.FilterOperator.EQ,toDate));
                                    } else {
                                        oBindingParams.filters.push(
                                            new sap.ui.model.Filter({
                                                filters: [
                                                    new sap.ui.model.Filter(
                                                        "InitiatedDate",
                                                        sap.ui.model.FilterOperator.GE,
                                                        fromDate
                                                    ),
                                                    new sap.ui.model.Filter(
                                                        "InitiatedDate",
                                                        sap.ui.model.FilterOperator.LE,
                                                        toDate
                                                    ),
                                                ],
                                                and: true,
                                            })
                                        );
                                    }
                                    break;

                                case "PermitType":
                                    oBindingParams.filters.push(
                                        new sap.ui.model.Filter(
                                            "PermitType",
                                            sap.ui.model.FilterOperator.EQ,
                                            sPermitTypeKey
                                        )
                                    );
                                    break;
                                default:
                                    break;
                            }
                    });

                    console.log("test");
                    // Clear existing filters if needed
                },

                
                /**
                 * Used to navigate to the marketing request details page
                 * @param {*} oEvent current instance of the event
                 */

                onColumnListItemPress(oEvent) {
                    const sPath = oEvent
                        .getSource()
                        .getBindingContext()
                        .getPath();
                    const reqId = sPath.match(/\d+/)[0];
                    let CrossApplicationNavigation =
                        sap.ushell.Container.getService(
                            "CrossApplicationNavigation"
                        );
                    CrossApplicationNavigation.toExternal({
                        target: {
                            semanticObject: "ZMKTCAMP",
                            action: "display",
                        },
                        params: {
                            RequestId: reqId,
                        },
                    })
                },
    });
});
