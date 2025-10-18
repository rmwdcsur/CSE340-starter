// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build the Vehicle Details view
router.get("/detail/:invId", invController.buildByInvId);


// Middleware causes an error
router.use("/", utilities.handleErrors(async (req, res, next) => {
        throw new Error("Middleware intentionally throwing an exception")
    next();
}));

// Intentional 500 error route (Task 3)
//router.get("/error", utilities.handleErrors, invController.causeError);


module.exports = router;