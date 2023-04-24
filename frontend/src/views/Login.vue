<script setup lang="ts">
import { unauth_api_fetch } from '@/api';
import { useLoginStore } from '@/stores/login';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loginStore = useLoginStore();

const username = ref("");
const password = ref("");

async function logIn() {
    let res = await unauth_api_fetch("/login", {
        method: "POST",
        body: {
            username: username.value,
            password: password.value,
        }
    });

    if (res.status !== 200) {
        alert("Invalid username or password");
        return;
    }

    const json = await res.json();
    await loginStore.setToken(json.token)
    router.push({ name: "home" });
}

</script>

<template>
    <form @submit.prevent="logIn">
        <label for="usernameInput">Používateľské Meno</label>
        <input id="usernameInput" type="string" v-model.lazy="username" />
        <label for="passwordInput">Heslo</label>
        <input id="passwordInput" type="password" v-model.lazy="password" />
        <input class="submitButton" type="submit" value="Log In" />
    </form>
</template>
<style scoped>
label, input {
    display: block;
    width: 100%;
    font-size: 1.1em;
}

input {
    padding: 0.2em;
    border-radius: 5px;
    border: 1px solid var(--blue-color);
}

input:not([type="submit"]) {
    margin-bottom: 0.5em;
    font-size: 1em;
}

.submitButton {
    /* margin-top: 1em; */
    background-color: transparent;
    border: 2px solid var(--blue-color);
    padding: 0.2em;
    cursor: pointer;
}

.submitButton:hover {
    background-color: var(--blue-color);
    color: white;
}
</style>
