sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    "use strict";

    return {
        getStatusText: function (sStatus) {
            const oMap = {
                PCM: "Pending with Commercial Operations Manager",
                PMH: "Pending with Marketing Head",
                PGM: "Pending with GA Immigration & Admin Manager",
                PGS: "Pending with GA Specialist",
                APR: "Approved",
                REJ: "Rejected",
                DRF: "Draft",
                INI: "Initiated",
            };
            return oMap[sStatus] || sStatus || "";
        },
        getPermitTypeText: function (sPermitType) {
            const oMap = {
                SO: "Special Offer",
                RD: "Raffle Draw",
                SW: "Scratch & Win",
                SA: "Sales",
                AS: "Advertising Stickers",
            };
            return oMap[sPermitType] || sPermitType || "";
        },
        formatDate: function (oDate) {
            if (!oDate) return "";

            // Convert to JS Date if it's a string
            const dateObj = typeof oDate === "string" ? new Date(oDate) : oDate;

            // Use user's locale settings
            const oDateFormat = DateFormat.getDateInstance({
                style: "medium" // or use pattern: "dd.MM.yyyy" etc.
            });

            return oDateFormat.format(dateObj);
        }
    };
});
