import express from 'express';
import * as locationController from '../controller/location.js';
 
const router = express.Router();
router.get('/getNearAddress', locationController.getNearAddress);
router.get('/search',locationController.search);

export default router;