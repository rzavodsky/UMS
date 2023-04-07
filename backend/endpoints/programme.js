import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Programme } from '../db.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        FacultyId: { type: 'integer' },
        DegreeTypeId: { type: 'integer' },
    },
    required: ['name', 'FacultyId', 'DegreeTypeId']
}
const patch_schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
    }
}

router.use('/programmes/:id', validateIdParams)
router.use('/programmes/:id', async (req, res, next) => {
    const data = await Programme.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `Programme ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/programmes',
    async (_req, res) => {
        const data = await Programme.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/programmes/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/programmes',
    validate({ body: schema }),
    (req, res, next) => {
        Programme.create(req.body)
            .then(data => res.json(data))
            .catch(next)
    })

// Update
router.patch('/programmes/:id',
    validate({ body: patch_schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/programmes/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
