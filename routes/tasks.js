const router = require('express').Router()

const Tasks = require('../controller/tasks.controller')
const { requireAuth } = require('../middleware/passport')

router.get('/', requireAuth, Tasks.getAllTaskLists)
router.get('/:id', requireAuth, Tasks.getTaskListById)

router.put('/:id', requireAuth, Tasks.updateTaskListById)
router.put('/:id/:tid', requireAuth, Tasks.updateTaskById)

router.post('/', requireAuth, Tasks.createTaskList)
router.post('/:id', requireAuth, Tasks.createTask)

router.delete('/:id', requireAuth, Tasks.deleteTaskList)
router.delete('/:id/:tid', requireAuth, Tasks.deleteTask)

module.exports = router