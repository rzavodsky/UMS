import express, { json } from 'express'
import { ValidationError } from 'express-json-validator-middleware'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'

import country from './endpoints/country.js'
import city from './endpoints/city.js'
import classroom from './endpoints/classroom.js'
import degree_type from './endpoints/degree_type.js'
import faculty from './endpoints/faculty.js'
import programme from './endpoints/programme.js'
import student_group from './endpoints/student_group.js'
import subject from './endpoints/subject.js'
import lesson from './endpoints/lesson.js'
import teacher from './endpoints/teacher.js'
import student from './endpoints/student.js'
import student_subject from './endpoints/student_subject.js'

const port = 3000
const app = express()
const router = express.Router()

router.use(country)
router.use(city)
router.use(classroom)
router.use(degree_type)
router.use(faculty)
router.use(programme)
router.use(student_group)
router.use(subject)
router.use(lesson)
router.use(teacher)
router.use(student)
router.use(student_subject)

app.use(json())
app.use('/api', router)

// Error Handler
app.use((err, _req, res, _next) => {
    if (err instanceof ValidationError) {
        if (err.validationErrors.query) {
            res.status(400).json({
                error: 'Validation error',
                message: 'Invalid query parameters',
            })
            console.error(err.validationErrors.query)
            return
        }
        res.status(400).json({
            error: 'Validation Error',
            messages: err.validationErrors.body.map(verr => {
                if (verr.keyword === 'additionalProperties') {
                    return {
                        message: `Body must NOT contain additional property '${verr.params.additionalProperty}'`,
                        key: verr.params.additionalProperty,
                    }
                } else if (verr.keyword === 'required') {
                    return {
                        message: `Body ${verr.message}`,
                        key: verr.params.missingProperty,
                    }
                } else if (verr.keyword === 'enum') {
                    return {
                        key: verr.instancePath.substring(1),
                        message: `${verr.instancePath.substring(1)} must be one of [${verr.params.allowedValues.join(', ')}]`
                    }
                } else {
                    console.log(verr)
                    return {
                        message: `'${verr.instancePath.substring(1)}' ${verr.message}`,
                        key: verr.instancePath.substring(1),
                    }
                }
            }),
        })
    } else if (err instanceof ForeignKeyConstraintError) {
        res.status(400).json({
            error: "Foreign Key Error",
            message: err.original.detail,
        })
    } else if (err instanceof UniqueConstraintError) {
        res.status(400).json({
            error: "Unique Constraint Error",
            message: "Resource already exists",
        })
    } else if (err instanceof SyntaxError) {
        res.status(400).json({
            error: "Syntax Error",
            message: err.message,
        })
    } else {
        console.error(err)
        res.status(500).json({
            error: "Something went wrong."
        })
    }
})

// 404 Handler
app.use((_req, res, _next) => {
    res.status(404).json({
        error: "Not Found"
    })
})

app.listen(port, () => {
    console.log(`UMS backend listening on port ${port}`)
})
