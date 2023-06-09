import { Router } from 'express'
import { validateIdParams, validate } from '../validation.js'

import { StudentSubject, Person, Subject } from '../db.js'

const router = Router()

const PASSING_GRADES = ['A', 'B', 'C', 'D', 'E']
const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        StudentId: { type: 'integer' },
        SubjectId: { type: 'integer' },
    },
    required: ['StudentId', 'SubjectId'],
}
const patch_schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        grade: { enum: ['A', 'B', 'C', 'D', 'E', 'Fx', null]},
    }
}

router.use('/studentsubjects/:id', validateIdParams)
router.use('/studentsubjects/:id', async (req, res, next) => {
    const data = await StudentSubject.findByPk(req.params.id)
    if (data === null) {
        return res.status(404).json({ error: `StudentSubject ${req.params.id} not found` })
    }
    res.locals.data = data
    next()
})

// List
router.get('/studentsubjects',
    validate({
        query: {
            type: 'object',
            additionalProperties: false,
            properties: {
                StudentId: { type: 'string', pattern: '^\\d+$' },
                SubjectId: { type: 'string', pattern: '^\\d+$' },
            }, 
            anyOf: [                
                { required: ['SubjectId'] },
                { required: ['StudentId'] },
            ]
        }
    }),
    async (req, res) => {
        const where_query = {}
        let include = []
        if (req.query.SubjectId) {
            where_query.SubjectId = +req.query.SubjectId
            include = [Person]
        }
        if (req.query.StudentId) {
            where_query.PersonId = +req.query.StudentId
            include = [Subject]
        }
        const data = await StudentSubject.findAll({ where: where_query, include })
        res.json({ data: data })
    })

// Retrieve
router.get('/studentsubjects/:id',
    async (_req, res) => {
        res.json(res.locals.data)
    })

// Create
router.post('/studentsubjects',
    validate({ body: schema }),
    (req, res, next) => {
        if (req.key.PersonId !== req.body.StudentId) {
            res.status(403).end()
            return
        }
        const body = {
            SubjectId: req.body.SubjectId,
            PersonId: req.body.StudentId,
        }
        StudentSubject.create(body)
            .then(data => res.json(data))
            .catch(next)
    })

// Update
router.patch('/studentsubjects/:id',
    validate({ body: patch_schema }),
    async (req, res) => {
        if (!req.key.isTeacher) {
            res.status(403).end()
            return
        }
        const gradeBefore = res.locals.data.grade;
        res.locals.data.set(req.body)
        const gradeAfter = res.locals.data.grade;
        const student = await Person.findByPk(res.locals.data.PersonId)
        const subject = await Subject.findByPk(res.locals.data.SubjectId)
        if (PASSING_GRADES.includes(gradeBefore) && !PASSING_GRADES.includes(gradeAfter)) {
            student.decrement('studentCredits', { by: subject.credits })
        } else if (!PASSING_GRADES.includes(gradeBefore) && PASSING_GRADES.includes(gradeAfter)) {
            student.increment('studentCredits', { by: subject.credits })
        }
        await res.locals.data.save()
        res.json(res.locals.data)
    })

// Delete
router.delete('/studentsubjects/:id',
    async (req, res) => {
        if (req.key.PersonId !== res.locals.data.PersonId) {
            res.status(403).end()
            return
        }
        await res.locals.data.destroy()
        res.status(204).end() // No Content
    })
export default router
