import express from 'express'
// import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getBoards, getBoardById, addBoard, updateBoard, removeBoard, addBoardMsg, removeBoardMsg } from './board.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', getBoards)
router.get('/:id', getBoardById)
router.post('/', addBoard)
router.put('/:id', updateBoard)
router.delete('/:id', removeBoard)
// router.delete('/:id', requireAuth, requireAdmin, removeBoard)

// router.post('/:id/msg', requireAuth, addBoardMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removeBoardMsg)

export const boardRoutes = router
