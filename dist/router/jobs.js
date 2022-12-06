import express from 'express';
import * as jobsController from '../controller/jobs.js';
const router = express.Router();
router.get('/', jobsController.getJobslist);
router.get('/:id', jobsController.getJobById);
router.post('/createJob', jobsController.createJob);
router.post('/search', jobsController.search);
export default router;
//# sourceMappingURL=jobs.js.map