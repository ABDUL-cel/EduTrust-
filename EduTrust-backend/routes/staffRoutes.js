const express = require("express");
const router = express.Router();
 const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  registerStaff,
  getPendingStaff,
  approveStaff,
  rejectStaff,
  createStaff,
  getStaff,
  getStaffMember,
  updateStaff,
  suspendStaff,
  activateStaff
} = require("../controllers/staffController");

// =======================================
// PUBLIC ROUTE (Self-Registration)
// =======================================
router.post("/register", registerStaff);

// =======================================
// PROTECTED ROUTES (Principal & Admin)
// =======================================
router.use(authMiddleware);

// Approval Workflow
router.get("/pending", roleMiddleware("Principal"), getPendingStaff);
router.patch("/approve/:staff_id", roleMiddleware("Principal"), approveStaff);
router.delete("/reject/:staff_id", roleMiddleware("Principal"), rejectStaff);

// Staff Management (Collection Level)
router.post("/", roleMiddleware("Principal"), createStaff);
router.get("/", roleMiddleware("Principal"), getStaff);

// Staff Management (Individual Member Level)
router.get("/:id", roleMiddleware("Principal"), getStaffMember);
router.put("/:id", roleMiddleware("Principal"), updateStaff);
router.patch("/:id/suspend", roleMiddleware("Principal"), suspendStaff);
router.patch("/:id/activate", roleMiddleware("Principal"), activateStaff);

module.exports = router;
