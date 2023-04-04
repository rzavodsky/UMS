import { Router } from 'express'
import { validateIdParams } from '../validation.js'
import { Validator } from 'express-json-validator-middleware'
import { DegreeType } from '../db.js'

const router = Router()
const { validate } = new Validator()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        length: { type: 'integer' },
        requiredCredits: { type: 'integer' },
    }
}
const schema_required = ['name', 'length', 'requiredCredits']

router.use('/degreetypes/:id', validateIdParams)
router.use('/degreetypes/:id', async (req, res, next) => {
    const data = await DegreeType.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `DegreeType ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/degreetypes',
    async (_req, res) => {
        const data = await DegreeType.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/degreetypes/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/degreetypes',
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await DegreeType.create(req.body)
        res.json(data)
    })

// Update
router.patch('/degreetypes/:id',
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/degreetypes/:id',
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
