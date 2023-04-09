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
    }
}
const schema_required = ['weekDay', 'hour', 'duration', 'TeacherId', 'type', 'ClassroomId', 'StudentGroupId']

router.use('/subjects/:subjectId/lessons', validateIdParams)
router.use('/subjects/:subjectId/lessons/:id', validateIdParams)
router.use('/subjects/:subjectId/lessons*', async (req, res, next) => {
    const subjectId = req.params.subjectId
    const country = await Subject.findByPk(subjectId)
    if (country === null) {
        res.status(404).json({
            error: `Subject ${subjectId} not found`
        })
    } else {
        next()
    }
})
router.use('/subjects/:subjectId/lessons/:id', async (req, res, next) => {
    const data = await Lesson.findOne({
        where: {
            SubjectId: req.params.subjectId,
            id: req.params.id,
        }
    })
    if (data === null) {
        return res.status(404).json({ error: `Lesson ${req.params.id} not found for subject ${req.params.subjectId}` })
    }
    res.locals.data = data
    next()
})


// List
router.get('/subjects/:subjectId/lessons',
    async (req, res) => {
        const data = await Lesson.findAll({
            where: {
                SubjectId: req.params.subjectId
            }
        })
        res.json({ data: data })
    })

// Retrieve
router.get('/subjects/:subjectId/lessons/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/subjects/:subjectId/lessons',
    adminOnly,
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await Lesson.create({...req.body, SubjectId: req.params.subjectId})
        res.json(data)
    })

// Update
router.patch('/subjects/:subjectId/lessons/:id',
    adminOnly,
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/subjects/:subjectId/lessons/:id',
    adminOnly,
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
