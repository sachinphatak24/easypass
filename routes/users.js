import express from 'express';
const router = express.Router();

import { signin , signup , adminSignup} from '../controllers/user.js';



router.post("/admin/signup",adminSignup);


router.post("/signup",signup);

router.post("/signin",signin);

export default router;