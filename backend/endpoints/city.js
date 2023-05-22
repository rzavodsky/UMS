import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'
import { Country, City } from '../db.js'
import { adminOnly } from '../auth.js'

const router = Router()

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', maxLength: 255 },
        CountryId: { type: 'integer' },
    }
}
const schema_required = ['name', 'CountryId']

router.use('/cities/:id', validateIdParams)
router.use('/cities/:id', async (req, res, next) => {
    const data = await City.findOne({
        where: {
            id: req.params.id,
        }
    })
    if (data === null) {
        return res.status(404).json({ error: `City ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})


// List
router.get('/cities',
    async (req, res) => {
        const data = await City.findAll()
        res.json({ data: data })
    })

// Retrieve
router.get('/cities/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/cities',
    adminOnly,
    validate({ body: { ...schema, required: schema_required } }),
    async (req, res) => {
        const data = await City.create(req.body)
        res.json(data)
    })

// Update
router.patch('/cities/:id',
    adminOnly,
    validate({ body: schema }),
    async (req, res) => {
        res.locals.data.set(req.body)
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/cities/:id',
    adminOnly,
    async (_req, res) => {
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
