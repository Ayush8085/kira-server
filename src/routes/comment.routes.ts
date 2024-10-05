import express from 'express';
import { createComment, deleteComment, getComment, getComments, updateComment } from '../controllers/comment.controllers';

const router = express.Router();

router.post('/create/:issueId', createComment);
router.get('/get-all/:issueId', getComments);
router.get('/get/:commentId', getComment);
router.put('/update/:commentId', updateComment);
router.delete('/delete/:commentId', deleteComment);

export default router;