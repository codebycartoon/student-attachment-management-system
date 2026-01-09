/**
 * Phase 1 Authentication Routes
 * Role-based registration and authentication endpoints
 */

import { Router } from 'express';
import { AuthPhase1Controller } from '../controllers/auth-phase1.controller';
import { 
  authenticateToken, 
  optionalAuth 
} from '../middleware/auth';
import { 
  authRateLimit, 
  bruteForceProtection 
} from '../middleware/security';

const router = Router();
const authController = new AuthPhase1Controller();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Role-based registration endpoints
router.post('/register/student', 
  authRateLimit,
  bruteForceProtection,
  authController.registerStudent
);

router.post('/register/company', 
  authRateLimit,
  bruteForceProtection,
  authController.registerCompany
);

router.post('/register/admin', 
  authRateLimit,
  bruteForceProtection,
  authController.registerAdmin
);

// Login endpoint
router.post('/login', 
  authRateLimit,
  bruteForceProtection,
  authController.login
);

// Token refresh endpoint
router.post('/refresh', 
  authRateLimit,
  authController.refreshToken
);

// Password reset endpoints
router.post('/forgot-password', 
  authRateLimit,
  authController.forgotPassword
);

router.post('/reset-password', 
  authRateLimit,
  authController.resetPassword
);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Logout endpoint
router.post('/logout', 
  authenticateToken,
  authController.logout
);

// Password change endpoint
router.post('/change-password', 
  authenticateToken,
  authController.changePassword
);

// Current user profile
router.get('/me', 
  authenticateToken,
  authController.getCurrentUser
);

// Session management
router.get('/sessions', 
  authenticateToken,
  authController.getUserSessions
);

router.delete('/sessions/:sessionId', 
  authenticateToken,
  authController.revokeSession
);

router.delete('/sessions', 
  authenticateToken,
  authController.revokeAllSessions
);

export default router;