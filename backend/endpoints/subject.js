import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Subject } from '../db.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        FacultyId: { type: 'integer' },
        excerciseAmount: { type: 'integer' },
        lectureAmount: { type: 'integer' },
        credits: { type: 'integer' },
        semester: { type: 'integer' },
        description: { type: 'string', maxLength: 4096 },
    },
    required: ['name', 'FacultyId', 'excerciseAmount', 'lectureAmount', 'credits', 'semester'],
}
const patch_schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        excerciseAmount: { type: 'integer' },
        lectureAmount: { type: 'integer' },
        credits: { type: 'integer' },
        semester: { type: 'integer' },
        description: { type: 'string', maxLength: 4096 },
    }
}

router.use('/subjects/:id', validateIdParams)
router.use('/subjects/:id', async (req, res, next) => {
    const data = await Subject.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `Subject ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/subjects',
    async (_req, res) => {
        const data = await Subject.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/subjects/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/subjects',
    validate({ body: schema }),
    (req, res, next) => {
        Subject.create(req.body)
            .then(data => res.json(data))
            .catch(next)
    })

// Update
router.patch('/subjects/:id',
    validate({ body: patch_schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/subjects/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
