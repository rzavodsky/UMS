import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { StudentGroup } from '../db.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        ProgrammeId: { type: 'integer' },
    },
    required: ['name', 'ProgrammeId']
}
const patch_schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
    }
}

router.use('/studentgroups/:id', validateIdParams)
router.use('/studentgroups/:id', async (req, res, next) => {
    const data = await StudentGroup.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `StudentGroup ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/studentgroups',
    async (_req, res) => {
        const data = await StudentGroup.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/studentgroups/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/studentgroups',
    validate({ body: schema }),
    (req, res, next) => {
        StudentGroup.create(req.body)
            .then(data => res.json(data))
            .catch(next)
    })

// Update
router.patch('/studentgroups/:id',
    validate({ body: patch_schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/studentgroups/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
