<script setup lang="ts">
import { api_fetch } from '@/api';
import { ref } from 'vue';

const oldPwd = ref("");
const newPwd = ref("");
const newPwdAgain = ref("");
const status = ref("");

async function submit() {
    if (newPwd.value === "" || oldPwd.value === "") {
        status.value = "Heslo nesmie byť prázdne";
        return;
    }
    if (newPwd.value != newPwdAgain.value) {
        status.value = "Heslá sa nezhodujú";
        return;
    }
    const res = await api_fetch("/changepwd", {
        method: "POST",
        body: {
            oldPassword: oldPwd.value,
            newPassword: newPwd.value,
        },
    });
    if (res.status === 400) {
        status.value = "Nesprávne heslo";
        return;
    }
    status.value = "Heslo úspešne zmenené";
}
</script>

<template>
    <div class="status" v-if="status != ''">{{status}}</div>
    <form @submit.prevent="submit">
        <label for="oldPwd" >Staré heslo</label>
        <input v-model="oldPwd" id="oldPwd" type="password" />
        <label for="newPwd" >Nové heslo</label>
        <input v-model="newPwd" id="newPwd" type="password" />
        <label for="newPwdAgain" >Znovu nové heslo</label>
        <input v-model="newPwdAgain" id="newPwdAgain" type="password" />
        <input type="submit" value="Zmeniť heslo" class="button-primary" />
    </form>
</template>

<style scoped>
input[type=password] {
    display: block;
    padding: 0.2em;
    margin-bottom: 0.5em;
}

.status {
    margin-bottom: 1em;
    font-weight: bold;
}
</style>
