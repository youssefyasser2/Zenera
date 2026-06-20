import { Router } from "express";
import { UserController } from "../controllers/user_controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { 
  canManageUsers, 
  canCreateUsers, 
  canAssignRoles,
  isManagerOrAdmin,
  isAdminOnly,
  permit 
} from "../middlewares/RBAC.middleware";

const router = Router();

// ✅ All routes require authentication
router.use(requireAuth);

// 1. Fetch users (any registered user - but with company scoping)
router.get("/", UserController.getUsers);

// 2. Fetch profile (any logged user)
router.get("/me", UserController.getMe);

// 3. search unlinked users
router.get('/search-unlinked', isManagerOrAdmin, UserController.searchUnlinkedUsers);

// 4. Retrieve a user by ID (Admin or Manager only)
router.get("/:id", isManagerOrAdmin, UserController.getUserById);

// 5. Create a user (Admin or Manager)
router.post("/", canCreateUsers, UserController.createUser);


// ✅ Update current user's own profile
router.put("/me", requireAuth, UserController.updateMyProfile);


// 6. Edit a user (Admin or Manager)
router.put("/:id", canManageUsers, UserController.updateUser);



// 7. Delete a user (Admin only)
router.delete("/:id", isAdminOnly, UserController.deleteUser);

// 8. Add new employee (Manager only)
router.post("/add-employee", isManagerOrAdmin, UserController.addEmployee);

// 9. Link existing employee (Manager only)
router.post("/link-employee/:employeeId", isManagerOrAdmin, UserController.linkEmployee);

export default router;