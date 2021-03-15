const router = require('express').Router()

const Task = require('../models/Task')
const TaskList = require('../models/TaskList')
const { requireAuth } = require('../middleware/passport')

router.get('/', requireAuth, async(req, res) => {
    try {
        const lists = await TaskList.find({ owner: req.user.id })
        res.send(lists)
    } catch (err) {
        console.log(err)
        res.send("Could Not Fetch Lists")
    }
})

router.get('/:id', requireAuth, async(req, res) => {
    try {
        const list = await TaskList.findById(req.params.id)
        if (!list.owner.equals(req.user.id)) return res.status(401).send({ error: 'Access Denied' })

        const tasks = await Task.find({ listId: req.params.id })
        res.send(tasks)
    } catch (err) {
        console.log(err)
        res.send("Could Not Fetch Task List")
    }
})

router.put('/:id', requireAuth, async(req, res) => {
    try {
        const { title } = req.body
        const list = await TaskList.findByIdAndUpdate(req.params.id, { $set: { title: title } })
        res.send(list)
    } catch (err) {
        console.log(err)
        res.send("Could Not Update")
    }
})

router.put('/:id/:tid', requireAuth, async(req, res) => {
    try {
        const { completed, title } = req.body
        const task = await Task.findByIdAndUpdate(req.params.tid, { $set: { completed, title } })
        res.send(task)
    } catch (err) {
        console.log(err)
        res.send("Could Not Update")
    }
})

router.post('/', requireAuth, async(req, res) => {
    try {
        const { title, description } = req.body
        const newList = new TaskList({
            title,
            description,
            owner: req.user.id
        })

        const list = await newList.save()
        return res.send(list)
    } catch (err) {
        console.log(err)
        res.send("Provide Valid Title For The List")
    }
})

router.post('/:id', requireAuth, async(req, res) => {
    try {
        const { title } = req.body

        const task = new Task({
            title,
            listId: req.params.id
        })

        list = await task.save()
        return res.send(task)
    } catch (err) {
        console.log(err)
        res.send("Provide A Valid Title")
    }
})

router.delete('/:id', requireAuth, async(req, res) => {
    try {
        await Task.deleteMany({ listId: req.params.id })
        await TaskList.findByIdAndDelete(req.params.id)
        return res.send("Deletion Success")
    } catch (err) {
        console.log(err)
        res.send("Could Not Delete List")
    }
})

router.delete('/:id/:tid', requireAuth, async(req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id)
        return res.send("Deletion Success")
    } catch (err) {
        console.log(err)
        res.send("Could Not Delete Task")
    }
})

module.exports = router