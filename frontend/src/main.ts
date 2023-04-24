import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import { useLoginStore } from './stores/login'

import './assets/base.css'

const app = createApp(App)

app.use(createPinia())
const login = useLoginStore()
const token = localStorage.getItem('token');
if (token !== null) {
    await login.setToken(token);
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => {
                if (login.user?.isAdmin) {
                    return import("@/views/Admin.vue")
                } else if (login.user?.isTeacher) {
                    return import("@/views/Teacher.vue")
                } else {
                    return import("@/views/Student.vue")
                }
            }
        },
        { path: '/login', component: Login, name: 'login' },
    ]
});
router.beforeEach((to, _from) => {
    if (!login.loggedIn && to.name !== 'login') {
        return { name: 'login' };
    }
});
app.use(router)

app.mount('#app')

