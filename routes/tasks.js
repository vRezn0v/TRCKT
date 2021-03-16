const router = require('express').Router()
const status = require('http-status-codes').StatusCodes

const Task = require('../models/Task')
const TaskList = require('../models/TaskList')
const { requireAuth } = require('../middleware/passport')

const { DELETE_SUCCESS, ERR_FETCH_LIST, ERR_FETCH_TASK, ERR_UPDATE, ERR_TITLE, ERR_DELETE } = require('../constants/constants')

router.get('/', requireAuth, async(req, res) => {
    try {
        const lists = await TaskList.find({ owner: req.user.id })
        res.status(status.OK).send(lists)
    } catch (err) {
        console.log(err)
        res.send(ERR_FETCH_LIST)
    }
})

router.get('/:id', requireAuth, async(req, res) => {
    try {
        const list = await TaskList.findById(req.params.id)
        if (!list.owner.equals(req.user.id)) return res.status(status.UNAUTHORIZED).send({ error: 'Access Denied' })

        const tasks = await Task.find({ listId: req.params.id })
        res.status(status.OK).send(tasks)
    } catch (err) {
        console.log(err)
        res.send(ERR_FETCH_TASK)
    }
})

router.put('/:id', requireAuth, async(req, res) => {
    try {
        const { title } = req.body
        const list = await TaskList.findByIdAndUpdate(req.params.id, { $set: { title: title } })
        res.status(status.OK).send(list)
    } catch (err) {
        console.log(err)
        res.send(ERR_UPDATE)
    }
})

router.put('/:id/:tid', requireAuth, async(req, res) => {
    try {
        const { completed, title } = req.body
        const task = await Task.findByIdAndUpdate(req.params.tid, { $set: { completed, title } })
        res.status(status.OK).send(task)
    } catch (err) {
        console.log(err)
        res.send(ERR_UPDATE)
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
        return res.status(status.OK).send(list)
    } catch (err) {
        console.log(err)
        res.send(ERR_TITLE)
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
        return res.status(status.OK).send(task)
    } catch (err) {
        console.log(err)
        res.send(ERR_TITLE)
    }
})

router.delete('/:id', requireAuth, async(req, res) => {
    try {
        await Task.deleteMany({ listId: req.params.id })
        await TaskList.findByIdAndDelete(req.params.id)
        return res.status(status.OK).send(DELETE_SUCCESS)
    } catch (err) {
        console.log(err)
        res.send(ERR_DELETE)
    }
})

router.delete('/:id/:tid', requireAuth, async(req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id)
        return res.status(status.OK).send(DELETE_SUCCESS)
    } catch (err) {
        console.log(err)
        res.send(ERR_DELETE)
    }
})

module.exports = router