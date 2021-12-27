import express from 'express';
const router = express.Router();

import { signin , signup } from '../controllers/user.js';


router.post("/signin",signin);
router.post("/signup",signup);


router.get('/signup', function(req, res){
    res.send({ title: 'Welcome!' });
});


export default router;