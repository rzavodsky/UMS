import { computed, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { api_fetch, type UserInfo } from '@/api'

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

