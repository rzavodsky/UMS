import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Subject, Lesson } from '../db.js'
import { adminOnly } from '../auth.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        weekDay: { type: 'integer', minimum: 0, maximum: 6 },
        hour: { type: 'integer', minimum: 7, maximum: 19 },
        duration: { type: 'integer', minimum: 0, maximum: 5 },
        TeacherId: { type: 'integer' },
        type: { enum: ['lecture', 'excercise'] },
        ClassroomId: { type: 'integer' },
        StudentGroupId: { type: 'integer' },
        SubjectId: { type: 'integer' },
    }
}
const schema_required = ['weekDay', 'hour', 'duration', 'TeacherId', 'type', 'ClassroomId', 'StudentGroupId', 'SubjectId']

router.use('/lessons/:id', validateIdParams)
router.use('/lessons/:id', async (req, res, next) => {
    const data = await Lesson.findOne({
        where: {
            id: req.params.id,
        }
    })
    if (data === null) {
        return res.status(404).json({ error: `Lesson ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})


// List
router.get('/lessons',
    async (_req, res) => {
        const data = await Lesson.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/lessons/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/lessons',
    adminOnly,
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await Lesson.create(req.body)
        res.json(data)
    })

// Update
router.patch('/lessons/:id',
    adminOnly,
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/lessons/:id',
    adminOnly,
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
