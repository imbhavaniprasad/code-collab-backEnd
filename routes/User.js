import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { signup, signin, myProfile } from "../controllers/User.js";

router.post('/signup', signup);
router.post('/signin', signin);
router.get("/me", auth, myProfile);
export default router;