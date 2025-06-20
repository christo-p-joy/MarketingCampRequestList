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
                            if (oData.Role === "Approver" || oData.Role === "Viewer") {
                                oFilterMdoel.setProperty("/mode", "Approver");
                            }
                            else
                                oFilterMdoel.setProperty("/mode", "Requester");
                            oView.setBusy(false);
                        },
                        error: function (oError) {
                            oView.setBusy(false);
                        },
                    });
                },
                
                  /**
                 * @description Handles the binding parameter before binding the table
                 * @param {
                 * } oEvent 
                 */
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
                                            element[1]
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
                                    const dateRange = element[1].split(" - ");

                                    /**
                                     * Used for parsing the date and adjusting it to the local timezone
                                     * @param {*} dateStr 
                                     * @returns parsed date object
                                     */

                                    function parseAndAdjustDate(dateStr) {
                                     const date = new Date(dateStr);
                                        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                                        // Format as YYYY-MM-DD for SAP
                                        return date.toISOString().split("T")[0];
                                    }

                                    const fromDate = parseAndAdjustDate(
                                        dateRange[0]
                                    );
                                    const toDate = parseAndAdjustDate(
                                        dateRange[1]
                                    );


                                    if (dateRange[0] === dateRange[1]) {
                                        oBindingParams.filters.push(new sap.ui.model.Filter("InitiatedDate", sap.ui.model.FilterOperator.EQ, fromDate));
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
                                            element[1]
                                        )
                                    );
                                    break;
                                default:
                                    break;
                            }
                    });
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
                            action: "create",
                        },
                        params: {
                            RequestId: reqId,
                        },
                    })
                },
    });
});
