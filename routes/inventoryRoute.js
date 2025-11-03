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

// Route to Management Links
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to Add Classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to Add Vehicle view
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicle));

// Route to process the Add Classification data
router.post(    
    '/add-classification',
    regValidate.classificationRules(),
    regValidate.checkRegData,    
    //utilities.handleErrors(invController.registerClassification))
    invController.registerClassification);

// Route to process the Add Vehicle data
router.post(    
    '/add-vehicle',
    regValidate.vehicleRules(),
    regValidate.checkVehicleData,
    //utilities.handleErrors(invController.registerClassification))
    invController.registerVehicle);

// Middleware causes an error
router.use("/test-error", utilities.handleErrors(async (req, res, next) => {
        throw new Error("Middleware intentionally throwing an exception")
    next();
}));

// Intentional 500 error route (Task 3)
//router.get("/error", utilities.handleErrors, invController.causeError);


module.exports = router;