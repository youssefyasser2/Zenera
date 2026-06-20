// src/routes/shift.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { ShiftController } from '../controllers/shift_Controller';
import { UserRole } from '../constant/role';

const router = Router();

// === 1. All routes require authentication ===
router.use(requireAuth);

// === 2. Employee-only: view own shifts (and manager/admin can view any) ===
router.get('/employee/:userId', ShiftController.getEmployeeShifts);

// === 3. Employee: view own upcoming shifts ===
router.get('/my', ShiftController.getMyShifts);

// === 4. Manager & Admin only: full CRUD + company-wide view ===
router.use(requireRole([UserRole.MANAGER, UserRole.ADMIN]));

router.post('/', ShiftController.create);
router.get('/', ShiftController.getCompanyShifts);
router.put('/:id', ShiftController.update);
router.delete('/:id', ShiftController.delete);

export default router;