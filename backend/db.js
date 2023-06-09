import { DataTypes, Sequelize } from 'sequelize'

const sequelize = new Sequelize('postgres', 'postgres', 'supersecretpasswordplsdontsteal', {
    dialect: 'postgres',
    host: 'db',
})

export const Country = sequelize.define('Country', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
})

export const City = sequelize.define('City', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
})

export const Classroom = sequelize.define('Classroom', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true },
})

export const DegreeType = sequelize.define('DegreeType', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    length: DataTypes.INTEGER,
    requiredCredits: DataTypes.INTEGER,
})

export const Faculty = sequelize.define('Faculty', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    shortcut: { type: DataTypes.STRING(5), unique: true },
    description: DataTypes.TEXT,
})

export const Programme = sequelize.define('Programme', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
})

export const StudentGroup = sequelize.define('StudentGroup', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
})

export const Subject = sequelize.define('Subject', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    excerciseAmount: DataTypes.INTEGER,
    lectureAmount: DataTypes.INTEGER,
    credits: DataTypes.INTEGER,
    semester: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    shortcut: DataTypes.STRING,
})

export const Person = sequelize.define('Person', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    studentCredits: DataTypes.INTEGER,
    birthDate: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    loginUsername: { type: DataTypes.STRING, unique: true },
    loginPassword: DataTypes.STRING,
    isTeacher: DataTypes.BOOLEAN,
})

export const StudentSubject = sequelize.define('StudentSubject', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grade: DataTypes.STRING,
}, {
    indexes: [{ unique: true, fields: ['PersonId', 'SubjectId'] }]
})

export const Lesson = sequelize.define('Lesson', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    weekDay: DataTypes.INTEGER,
    hour: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    type: DataTypes.STRING,
})

export const Key = sequelize.define('Key', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    expiresAt: DataTypes.DATE,
    isAdmin: DataTypes.BOOLEAN,
    isTeacher: DataTypes.BOOLEAN,
    hashedKey: { type: DataTypes.STRING(64), unique: true },
})
Key.belongsTo(Person, {
    onDelete: 'CASCADE',
})
Person.hasMany(Key)

Country.hasMany(City, { onDelete: 'CASCADE'})

City.hasMany(Person)
City.belongsTo(Country)

Classroom.hasMany(Lesson)

DegreeType.hasMany(Programme, {
    onDelete: 'CASCADE',
})

Faculty.hasMany(Subject, {
    onDelete: 'CASCADE',
})
Faculty.hasMany(Programme, {
    onDelete: 'CASCADE',
})
Faculty.hasMany(Person, { foreignKey: 'TeacherFacultyId' })

Programme.hasMany(StudentGroup, {
    onDelete: 'CASCADE',
})
Programme.belongsTo(Faculty)
Programme.belongsTo(DegreeType)

StudentGroup.hasMany(Person)
StudentGroup.hasMany(Lesson)
StudentGroup.belongsTo(Programme)

Subject.hasMany(StudentSubject, {
    onDelete: 'CASCADE',
})
Subject.hasMany(Lesson, {
    onDelete: 'CASCADE',
})
Subject.belongsTo(Faculty)

Person.hasMany(StudentSubject, {
    onDelete: 'CASCADE',
})
Person.hasMany(Lesson, {
    foreignKey: 'TeacherId'
})
Person.belongsTo(StudentGroup)
Person.belongsTo(Faculty, { as: 'TeacherFaculty' })
Person.belongsTo(City)

StudentSubject.belongsTo(Person)
StudentSubject.belongsTo(Subject)

Lesson.belongsTo(Subject)
Lesson.belongsTo(Person, { as: 'Teacher' })
Lesson.belongsTo(Classroom)
Lesson.belongsTo(StudentGroup)

await sequelize.sync({alter: true})
