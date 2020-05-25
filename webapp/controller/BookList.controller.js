sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel"
], function (Controller, MessageToast, Fragment, ResourceModel) {
    "use strict";
    return Controller.extend("org.ubb.books.controller.BookList", {
        onInit : function () {
            var i18nModel = new ResourceModel({
                bundleName: "org.ubb.books.i18n.i18n"
            });
            this.getView().setModel(i18nModel, "i18n");
        },
        onDelete() {
            const selectedRows = this.byId("idBooksTable").getSelectedContexts();
            if (selectedRows.length === 0) {
                MessageToast.show("No book was selected!");
            } else {
                const selectedRow = selectedRows[0];
                const isbnPath = selectedRow.getPath();
                this.getView().getModel().remove(isbnPath, {
                    success: () => {
                        var oBundle = this.getView().getModel("i18n").getResourceBundle();
                        var sMsg = oBundle.getText("bookDeleted");
                        MessageToast.show(sMsg);
                    },
                    error: () => {
                        var oBundle = this.getView().getModel("i18n").getResourceBundle();
                        var sMsg = oBundle.getText("bookNotDeleted");
                        MessageToast.show(sMsg);
                    }
                },);
            }
        },
        onAdd() {
            var book = {
                ISBN: "",
                Author: "",
                Title: "",
                DatePublication: "",
                Language: "",
                TotalNumber: 0,
                AvailableNumber: 0,
                CreatedOn: "",
                CreatedBy: "",
                ChangedOn: "",
                ChangedBy: ""
            };
            var oView = this.getView();

            // create dialog lazily
            if (!this.byId("idBookAddDialog")) {
                // load asynchronous XML fragment
                Fragment.load({
                    id: oView.getId(),
                    name: "org.ubb.books.view.AddDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    var oModel = new sap.ui.model.json.JSONModel();
                    oDialog.setModel(oModel);
                    oDialog.getModel().setData(book);
                    oDialog.open();
                });
            } else {
                oDialog.getModel().setData(book);
                this.byId("idBookAddDialog").open();
            }
        },
        handleCancel() {
            this.byId("idBookAddDialog").close();
        },
        handleSave(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = oEvent.getSource().getModel();
            var oDialogData = oModel.getData();
            var validForm = true;
            if(oDialogData.ISBN.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("isbnReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Author.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("authReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Title.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("titleReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Language.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("langReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Language !== 'EN' || oDialogData.Language !== 'DE' || oDialogData.Language !== 'RU'
            || oDialogData.Language !== 'FR' || oDialogData.Language !== 'PT' || oDialogData.Language !== 'ES') {
                validForm = false;
                var sMsg = oBundle.getText("invalidLanguage");
                MessageToast.show(sMsg);
            }
            oDialogData.AvailableNumber = parseInt(oDialogData.AvailableNumber);
            oDialogData.TotalNumber = parseInt(oDialogData.TotalNumber);
            if(oDialogData.AvailableNumber > oDialogData.TotalNumber) {
                validForm = false;
                var sMsg = oBundle.getText("noGreater");
                MessageToast.show(sMsg);
            }
            oDialogData.DatePublication = "2015-12-31T00:00:00";
            oDialogData.CreatedOn = "2015-12-31T00:00:00";
            oDialogData.ChangedOn = "2015-12-31T00:00:00";
            if(validForm) {
                this.getView().getModel().create("/Books", oDialogData, {
                    success: function () {
                        var sMsg = oBundle.getText("bookInserted");
                        MessageToast.show(sMsg);
                    },
                    error: function () {
                        var sMsg = oBundle.getText("bookNotInserted");
                        MessageToast.show(sMsg);
                    }
                });
            }
        },
        onUpdate(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            const selectedRows = this.byId("idBooksTable").getSelectedContexts();
            if (selectedRows.length === 0) {
                var sMsg = oBundle.getText("noBook");
                MessageToast.show(sMsg);
            } else {
                var oView = this.getView();
                var oObject = oView.byId("idBooksTable").getSelectedContexts()[0].getObject();
                var book = {
                    ISBN: oObject.ISBN,
                    Author: oObject.Author,
                    Title: oObject.Title,
                    DatePublication: oObject.DatePublication,
                    Language: oObject.Language,
                    TotalNumber: oObject.TotalNumber,
                    AvailableNumber: oObject.AvailableNumber,
                    CreatedOn: "",
                    CreatedBy: "",
                    ChangedOn: "",
                    ChangedBy: ""
                };
                if (!this.byId("idBookUpdateDialog")) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "org.ubb.books.view.UpdateDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        var oModel = new sap.ui.model.json.JSONModel();
                        oDialog.setModel(oModel);
                        oDialog.getModel().setData(book);
                        oDialog.open();
                    });
                } else {
                    var oModel = new sap.ui.model.json.JSONModel();
                    oDialog.setModel(oModel);
                    oDialog.getModel().setData(book);
                    this.byId("idBookUpdateDialog").open();
                }
            }
        },
        handleCancelUpdate() {
            this.byId("idBookUpdateDialog").close();
        },
        handleUpdate(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = oEvent.getSource().getModel();
            var oDialogData = oModel.getData();
            var validForm = true;
            if(oDialogData.ISBN.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("isbnReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Author.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("authorReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Title.length === 0) {
                validForm = false;
                MessageToast.show("Title is required!");
            }
            if(oDialogData.Title.language === 0) {
                validForm = false;
                var sMsg = oBundle.getText("langReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Language !== 'EN' || oDialogData.Language !== 'DE' || oDialogData.Language !== 'RU'
                || oDialogData.Language !== 'FR' || oDialogData.Language !== 'PT' || oDialogData.Language !== 'ES') {
                validForm = false;
                var sMsg = oBundle.getText("invalidLanguage");
                MessageToast.show(sMsg);
            }
            oDialogData.AvailableNumber = parseInt(oDialogData.AvailableNumber);
            oDialogData.TotalNumber = parseInt(oDialogData.TotalNumber);
            if(oDialogData.AvailableNumber > oDialogData.TotalNumber) {
                validForm = false;
                var sMsg = oBundle.getText("noGreater");
                MessageToast.show(sMsg);
            }
            oDialogData.DatePublication = "2015-12-31T00:00:00";
            oDialogData.CreatedOn = "2015-12-31T00:00:00";
            oDialogData.ChangedOn = "2015-12-31T00:00:00";
            if(validForm) {
                var oView = this.getView();
                var sPath = oView.byId("idBooksTable").getSelectedContexts()[0].getPath();
                this.getView().getModel().update(sPath, oDialogData, {
                    success: function () {
                        var sMsg = oBundle.getText("bookUpdated");
                        MessageToast.show(sMsg);
                    },
                    error: function () {
                        var sMsg = oBundle.getText("bookNotUpdated");
                        MessageToast.show(sMsg);
                    }
                });
            }
        }
    });
});