import { Router } from 'express'
import { validateIdParams } from '../validation.js'
import { Validator } from 'express-json-validator-middleware'
import { Country } from '../db.js'

const router = Router()
const { validate } = new Validator()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
    }
}
const schema_required = ['name']   

router.use('/countries/:id', validateIdParams)
router.use('/countries/:id', async (req, res, next) => {
    const data = await Country.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `Country ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/countries',
    async (_req, res) => {
        const data = await Country.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/countries/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/countries',
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await Country.create(req.body)
        res.json(data)
    })

// Update
router.patch('/countries/:id',
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/countries/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
