import { useLoginStore } from "@/stores/login"
const API_URL = "/api"

let login: ReturnType<typeof useLoginStore> | null = null;
export function getLogin() {
    if (login === null) {
        login = useLoginStore()
    }
    return login
}

type RequestOptions = {
    body?: any,
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    headers?: HeadersInit,
}

/**
 * A wrapper around fetch to get data from the local API.
 * Automatically handles auth and converts body to json.
 */
export async function api_fetch(url: string, options?: RequestOptions) {
    if (!getLogin().token === null) {
        throw new Error("Trying to fetch from api without being logged in")
    }

    const headers = new Headers(options?.headers)
    headers.set('Authorization', `Bearer ${getLogin().token}`)
    if (options?.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    const result = await fetch(API_URL + url, {
        body: JSON.stringify(options?.body),
        method: options?.method ?? 'GET',
        headers: headers,
    })

    if (result.status === 401) {
        await getLogin().setToken(null);
    }
    return result;
}

/**
 * A wrapper around fetch similar to api_fetch, except it does unauthorized requests.
 */
export async function unauth_api_fetch(url: string, options?: RequestOptions) {
    const headers = new Headers(options?.headers)
    if (options?.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    return await fetch(API_URL + url, {
        body: JSON.stringify(options?.body),
        method: options?.method ?? 'GET',
        headers: headers,
    })
}

export interface Subject {
    id: number,
    name: string,
    credits: number,
    lectureAmount: number,
    excerciseAmount: number,
    semester: number,
    description: string,
}

export interface StudentSubject {
    id: number,
    grade: "A" | "B" | "C" | "D" | "E" | "Fx" | null,
    SubjectId: number,
    PersonId: number,
    Subject?: Subject,
    Person?: Student,
}

export interface Country {
    id: number,
    name: string,
}

export interface City {
    id: number,
    name: string,
    CountryId: number,
    Country?: Country,
}

export interface DegreeType {
    id: number,
    name: string,
    length: number,
    requiredCredits: number,
}

export interface Faculty {
    id: number,
    name: string,
    shortcut: string,
    description: string,
}

export interface Programme {
    id: number,
    name: string,
    DegreeTypeId: number,
    DegreeType?: DegreeType,
    FacutlyId: number,
    Faculty?: Faculty,
}

export interface StudentGroup {
    id: number,
    name: string,
    ProgrammeId: number,
    Programme?: Programme,
}

export interface Classroom {
    id: number,
    name: string,
}

export interface Lesson {
    id: number,
    weekDay: number
    hour: number,
    duration: number,
    type: "lecture" | "excercise",
    ClassroomId: number,
    Classroom?: Classroom,
    StudentGroupId: number,
    StudentGroup?: StudentGroup,
    SubjectId: number,
    Subject?: Subject,
    TeacherId: number,
    Teacher?: Teacher,
}

interface Person {
    firstName: string,
    lastName: string,
    gender: string,
    id: number,
    birthDate: Date,
    loginUsername: string,
    CityId: number,
    City: City,
    isAdmin?: false,
    isTeacher: boolean,
}

export interface Student extends Person {
    studentCredits: number,
    StudentGroupId: number,
    StudentGroup?: StudentGroup,
    isTeacher: false,
}

export interface Teacher extends Person {
    TeacherFacultyId: number,
    TeacherFaculty?: Faculty,
    isTeacher: true,
}

export type UserInfo =
    { isAdmin: true } |
    (Teacher & { isAdmin: false }) |
    (Student & { isAdmin: false })

export interface ResponseList<T> {
    data: T[],
}
