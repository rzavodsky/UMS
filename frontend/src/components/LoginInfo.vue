<script setup lang="ts">
import { api_fetch } from '@/api';
import { useLoginStore } from '@/stores/login';
import { useRouter } from 'vue-router';

const login = useLoginStore();
const router = useRouter();

async function logout() {
    await api_fetch('/logout', { method: 'DELETE' });
    router.push({ name: 'login' });
    login.setToken(null);
}
</script>

<template>
    <div class="login-info">
        {{ login.user.firstName }} {{ login.user.lastName }}
        <div class="login-dropdown">
            <div>Študijná skupina: {{ login.user.StudentGroupId }}</div>
            <div>Osobné číslo: {{ login.user.id }}</div>
            <button @click="logout">Odhlásiť sa</button>
        </div>
    </div>
</template>

<style scoped>
.login-info {
    position: relative;
    padding-block: 1em;
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
}

.login-info:hover .login-dropdown {
    transform: none;
}

.login-dropdown > * {
    padding: 0.5em;
}

button {
    background-color: transparent;
    border: none;
    font-size: inherit;
    cursor: pointer;
    width: 100%;
    text-align: left;
    border-radius: 5px;
    border: 1px solid var(--blue-color)
}
button:hover {
    background-color: var(--blue-color);
    color: white;
}
</style>
