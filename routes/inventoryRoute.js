// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/vehicle-validation')


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build the Vehicle Details view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// ADMIN-ONLY Routes
// Route to Management Links
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));
// Route to Add Classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
// Route to Add Vehicle view
router.get("/add-vehicle", utilities.checkAccountType, utilities.handleErrors(invController.buildAddVehicle));
// Route to process the Add Classification data
router.post(    
    '/add-classification',
    utilities.checkAccountType,
    regValidate.classificationRules(),
    regValidate.checkRegData,    
    //utilities.handleErrors(invController.registerClassification))
    invController.registerClassification);
// Route to process the Add Vehicle data
router.post(    
    '/add-vehicle',
    utilities.checkAccountType,
    regValidate.vehicleRules(),
    regValidate.checkVehicleData,
    //utilities.handleErrors(invController.registerClassification))
    invController.registerVehicle);
// Route to get inventory by classificationId and return as JSON
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));
// Route to edit Inventory item
router.get("/edit/:invId", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));
// Route to process the Edit Vehicle data
router.post(    
    '/update-vehicle',
    utilities.checkAccountType,
    regValidate.vehicleRules(),
    regValidate.checkUpdateData,    
    invController.updateVehicle);
// Route to delete Inventory item
router.get("/delete/:invId", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory));
// Route to process the Delete Inventory item
router.post(    
    '/delete-vehicle',
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteVehicle));


// Middleware causes an error
router.use("/test-error", utilities.handleErrors(async (req, res, next) => {
        throw new Error("Middleware intentionally throwing an exception")
    next();
}));

// Intentional 500 error route (Task 3)
//router.get("/error", utilities.handleErrors, invController.causeError);


module.exports = router;