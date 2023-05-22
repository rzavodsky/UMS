export type OtherData = { [endpointName: string]: any[] }

interface BaseField {
    name: string,
    key: string,
    type?: string,
    hidden?: boolean,
    constant?: boolean,
}
interface ForeignKeyField extends BaseField {
    type: "foreignKey",
    foreignResource: string,
}
interface ChoiceField extends BaseField {
    type: "choice",
    choices: {[key: string | number]: string} | string[],
}
interface NumberField extends BaseField {
    type: "number",
    min?: number,
    max?: number,
}
interface OtherField extends BaseField {
    type?: "string" | "date",
}
export type Field = ChoiceField | ForeignKeyField | NumberField | OtherField;

export type Resource = {
    name: string,
    endpoint: string,
    display: (datum: any) => any;
    fields: Field[],
}

export const resources: {[key: string]: Resource} = {
    countries: {
        name: "Krajiny",
        endpoint: "/countries",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
        ],
    },
    cities: {
        name: "Mestá",
        endpoint: "/cities",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
            {
                name: "Krajina",
                key: "CountryId",
                type: "foreignKey",
                foreignResource: "countries",
            },
        ]
    },
    classrooms: {
        name: "Triedy",
        endpoint: "/classrooms",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            }
        ]
    },
    degreetypes: {
        name: "Typy štúdia",
        endpoint: "/degreetypes",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
            {
                name: "Dĺžka",
                key: "length",
                type: "number",
                min: 1,
            },
            {
                name: "Potrebné kredity",
                key: "requiredCredits",
                type: "number",
                min: 0,
            }
        ]
    },
    faculties: {
        name: "Fakulty",
        endpoint: "/faculties",
        display: (datum: any) => datum.shortcut,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
            {
                name: "Skratka",
                key: "shortcut",
            },
            {
                name: "Popis",
                key: "description",
                hidden: true,
            }
        ]
    },
    lessons: {
        name: "Hodiny",
        endpoint: "/lessons",
        display: (datum: any) => datum.id,
        fields: [
            {
                name: "Predmet",
                key: "SubjectId",
                type: "foreignKey",
                foreignResource: "subjects",
            },
            {
                name: "Deň",
                key: "weekDay",
                type: "choice",
                choices: ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"],
            },
            {
                name: "Čas",
                type: "number",
                key: "hour",
                min: 7,
                max: 19,
            },
            {
                name: "Dĺžka",
                type: "number",
                key: "duration",
                min: 1,
                max: 13,
            },
            {
                name: "Typ",
                type: "choice",
                key: "type",
                choices: {
                    lecture: "Prednáška",
                    excercise: "Cvičenie",
                }
            },
            {
                name: "Trieda",
                foreignResource: "classrooms",
                key: "ClassroomId",
                type: "foreignKey",
            },
            {
                name: "Učiteľ",
                key: "TeacherId",
                type: "foreignKey",
                foreignResource: "teachers",
            },
            {
                name: "Štud. Skupina",
                key: "StudentGroupId",
                type: "foreignKey",
                foreignResource: "studentgroups",
            }
        ]
    },
    programmes: {
        name: "Odbory",
        endpoint: "/programmes",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name"
            },
            {
                name: "Fakulta",
                key: "FacultyId",
                type: "foreignKey",
                foreignResource: "faculties",
            },
            {
                name: "Typ Štúdia",
                key: "DegreeTypeId",
                type: "foreignKey",
                foreignResource: "degreetypes",
            }
        ]
    },
    studentgroups: {
        name: "Študijné skupiny",
        endpoint: "/studentgroups",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
            {
                name: "Odbor",
                key: "ProgrammeId",
                type: "foreignKey",
                foreignResource: "programmes",
            }
        ]
    },
    subjects: {
        name: "Predmety",
        endpoint: "/subjects",
        display: (datum: any) => datum.name,
        fields: [
            {
                name: "Názov",
                key: "name",
            },
            {
                name: "Počet prednášok",
                key: "lectureAmount",
                type: "number",
                min: 0,
            },
            {
                name: "Počet cvičení",
                key: "excerciseAmount",
                type: "number",
                min: 0,
            },
            {
                name: "Počet kreditov",
                key: "credits",
                type: "number",
                min: 0,
            },
            {
                name: "Semester",
                key: "semester",
                type: "number",
                min: 1,
            },
            {
                name: "Popis",
                key: "description",
                hidden: true,
            },
            {
                name: "Skratka",
                key: "shortcut",
            },
            {
                name: "Fakulta",
                key: "FacultyId",
                type: "foreignKey",
                foreignResource: "faculties",
            },
        ]
    },
    teachers: {
        name: "Učitelia",
        endpoint: "/teachers",
        display: (datum: any) => datum.firstName + " " + datum.lastName,
        fields: [
            {
                name: "Meno",
                key: "firstName",
            },
            {
                name: "Priezvisko",
                key: "lastName",
            },
            {
                name: "Dátum narodenia",
                key: "birthDate",
                type: "date",
            },
            {
                name: "Pohlavie",
                key: "gender",
                type: "choice",
                choices: {
                    male: "Muž",
                    female: "Žena",
                }
            },
            {
                name: "Prihlasovacie meno",
                key: "loginUsername",
                constant: true,
            },
            {
                name: "Fakulta",
                key: "FacultyId",
                type: "foreignKey",
                foreignResource: "faculties",
            },
            {
                name: "Mesto",
                key: "CityId",
                type: "foreignKey",
                foreignResource: "cities",
            },
        ]
    },
    students: {
        name: "Študenti",
        endpoint: "/students",
        display: (datum: any) => datum.firstName + " " + datum.lastName,
        fields: [
            {
                name: "Meno",
                key: "firstName",
            },
            {
                name: "Priezvisko",
                key: "lastName",
            },
            {
                name: "Dátum narodenia",
                key: "birthDate",
                type: "date",
            },
            {
                name: "Pohlavie",
                key: "gender",
                type: "choice",
                choices: {
                    male: "Muž",
                    female: "Žena",
                }
            },
            {
                name: "Prihlasovacie meno",
                key: "loginUsername",
                constant: true,
            },
            {
                name: "Študijná skupina",
                key: "StudentGroupId",
                type: "foreignKey",
                foreignResource: "studentgroups",
            },
            {
                name: "Kredity",
                key: "credits",
                type: "number",
                min: 0,
            },
            {
                name: "Mesto",
                key: "CityId",
                type: "foreignKey",
                foreignResource: "cities",
            },
        ]
    }
}

export function displayField(field: Field, datum: any, otherData?: OtherData) {
    if (field.type === undefined || field.type === "string" || field.type === "number" || field.type === "date") {
        return datum[field.key];
    } else if (field.type === "choice") {
        return field.choices[datum[field.key]];
    } else if (field.type === "foreignKey") {
        if (otherData === undefined) throw new Error("otherData is undefined");
        return resources[field.foreignResource].display(otherData[field.foreignResource][datum[field.key]]);
    } else {
        throw new Error("Invalid field type");
    }
}

export function getOtherResources(resourceName: string | number): string[] {
    const set = new Set<string>();
    for (const field of resources[resourceName].fields) {
        if (field.type === "foreignKey") {
            set.add(field.foreignResource);
        }
    }
    return Array.from(set);
}
