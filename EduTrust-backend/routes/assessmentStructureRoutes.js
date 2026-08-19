const express = require("express");

const router = express.Router();

const {authMiddleware} =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const {
    createAssessmentStructure,
    getAssessmentStructures,
    getAssessmentStructure,
    updateAssessmentStructure,
    deactivateAssessmentStructure
} =
    require(
        "../controllers/assessmentStructureController"
    );


router.use(authMiddleware);


// =======================================
// View Structures
// =======================================
router.get(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getAssessmentStructures
);


// =======================================
// View One Structure
// =======================================
router.get(
    "/:id",
    roleMiddleware(
        "Principal",
        "Vice Principal",
        "Teacher"
    ),
    getAssessmentStructure
);


// =======================================
// Create
// =======================================
router.post(
    "/",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    createAssessmentStructure
);


// =======================================
// Update
// =======================================
router.put(
    "/:id",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    updateAssessmentStructure
);


// =======================================
// Deactivate
// =======================================
router.patch(
    "/:id/deactivate",
    roleMiddleware(
        "Principal",
        "Vice Principal"
    ),
    deactivateAssessmentStructure
);


module.exports = router;
