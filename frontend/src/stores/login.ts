import { computed, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { api_fetch } from '@/api'

export const useLoginStore = defineStore('login', () => {
    const user: Ref<UserInfo | null> = ref(null)
    const token: Ref<Token | null> = ref(null)
    const loggedIn = computed(() => {
        return user.value !== null
    })
    async function setToken(newToken: string | null) {
        if (newToken === null) {
            token.value = null;
            user.value = null;
            localStorage.removeItem('token');
            return;
        }

        token.value = newToken;

        const res = await api_fetch("/me")
        if (res.status === 200) {
            user.value = await res.json();
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    }
    return { user, token, loggedIn, setToken }
})

type Token = string

interface BaseUser {
    firstName: string,
    lastName: string,
    gender: string,
    id: number,
    birthDate: Date,
    loginUsername: string,
    CityId: number,
}

export interface StudentUser extends BaseUser {
    studentCredits: number,
    StudentGroupId: number,
    isAdmin: false,
    isTeacher: false,
}

export interface TeacherUser extends BaseUser {
    TeacherFacultyId: number,
    isAdmin: false,
    isTeacher: true,
}

type UserInfo = { isAdmin: true } | TeacherUser | StudentUser
