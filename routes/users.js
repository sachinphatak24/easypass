import express from 'express';
const router = express.Router();

// Imported Route Data from Controllers
import { signin , signup , adminSignup} from '../controllers/user.js';

//Admin Route (Hidden)
router.post("/admin/signup",adminSignup);

//User Login (Public)
router.post("/signup",signup);

//User SignUp (Public)
router.post("/signin",signin);

export default router;