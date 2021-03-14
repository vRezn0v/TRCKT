const router = require('express').Router()

const Task = require('../models/Task')
const TaskList = require('../models/TaskList')
const { requireAuth } = require('../middleware/passport')

router.get('/', requireAuth, async(req, res) => {
    const lists = await TaskList.find({ owner: req.user.id })
    res.send(lists)
})

router.get('/:id', requireAuth, async(req, res) => {
    const list = await TaskList.findById(req.params.id)
    if (!list.owner.equals(req.user.id)) return res.status(401).send({ error: 'Access Denied' })

    const tasks = await Task.find({ listId: req.params.id })
    res.send(tasks)
})

router.put('/:id', requireAuth, async(req, res) => {
    const { title } = req.body
    const list = await TaskList.findByIdAndUpdate(req.params.id, { $set: { title: title } })
    res.send(list)
})

router.put('/:id/:tid', requireAuth, async(req, res) => {
    const { completed, title } = req.body
    const task = await Task.findByIdAndUpdate(req.params.tid, { $set: { completed, title } })
    res.send(task)
})

router.post('/', requireAuth, async(req, res) => {
    const { title, description } = req.body

    const newList = new TaskList({
        title,
        description,
        owner: req.user.id
    })

    const list = await newList.save()
    return res.send(list)
})

router.post('/:id', requireAuth, async(req, res) => {
    const { title } = req.body

    const task = new Task({
        title,
        listId: req.params.id
    })

    list = await task.save()
    return res.send(task)
})

router.delete('/:id', requireAuth, async(req, res) => {
    await Task.deleteMany({ listId: req.params.id })
    await TaskList.findByIdAndDelete(req.params.id)
    return res.send("Deletion Success")
})

router.delete('/:id/:tid', requireAuth, async(req, res) => {
    await Task.findByIdAndDelete(req.params.id)``
    return res.send("Deletion Success")
})

module.exports = router