import { Router } from 'express'
import { validateIdParams } from '../validation.js'
import { Validator } from 'express-json-validator-middleware'
import { Faculty } from '../db.js'

const router = Router()
const { validate } = new Validator()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        shortcut: { type: 'string', maxLength: 5 },
        description: { type: ['string', 'null'], maxLength: 4096 },
    }
}
const schema_required = ['name', 'shortcut']

router.use('/faculties/:id', validateIdParams)
router.use('/faculties/:id', async (req, res, next) => {
    const data = await Faculty.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `Faculty ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/faculties',
    async (_req, res) => {
        const data = await Faculty.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/faculties/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/faculties',
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await Faculty.create(req.body)
        res.json(data)
    })

// Update
router.patch('/faculties/:id',
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/faculties/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
