<script setup lang="ts">
import { api_fetch } from '@/api';
import { useLoginStore } from '@/stores/login';
import { useRouter, RouterLink } from 'vue-router';

const login = useLoginStore();
const router = useRouter();

async function logout() {
    await api_fetch('/logout', { method: 'DELETE' });
    router.push({ name: 'login' });
    login.setToken(null);
}
</script>

<template>
    <div v-if="login.user !== null" class="login-info">
        <template v-if="login.user.isAdmin">Admin</template>
        <template v-else>{{login.user.firstName}} {{login.user.lastName}}</template>
        <img class="chevron" src="/chevron-down-solid.svg" />
        <div class="login-dropdown">
            <template v-if="!login.user.isAdmin">
                <div v-if="!login.user.isTeacher">Študijná skupina: {{ login.user.StudentGroupId }}</div>
                <div v-if="!login.user.isTeacher">Kredity: {{login.user.credits}}</div>
                <div>Osobné číslo: {{ login.user.id }}</div>
                <RouterLink class="button-secondary" to="/heslo">Zmena hesla</RouterLink>
            </template>
            <button class="button-secondary" @click="logout">Odhlásiť sa</button>
        </div>
    </div>
</template>

<style scoped>
.login-info {
    position: relative;
    padding-block: 1em;
}

.chevron {
    height: 1em;
    filter: invert(100%);
    transition: rotate 0.5s;
    display: block;
    float: right;
    margin-left: 0.4em;
}

.login-info:hover .chevron {
    rotate: 180deg;
}

.login-dropdown {
    right: 0;
    width: max-content;
    position: absolute;
    background-color: white;
    color: black;
    margin-top: 0.5em;
    overflow: hidden;
    padding: 1em;
    transform: translate(0, -50%) scale(100%, 0);
    transition: transform 0.5s;
    box-shadow: 0 0 10px black;
}

.login-info:hover .login-dropdown {
    transform: none;
}

.login-dropdown > * {
    padding: 0.5em;
}

a, button {
    width: 100%;
    text-align: left;
    margin-bottom: 0.3em;
}
</style>
