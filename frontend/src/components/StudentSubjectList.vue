<script setup lang="ts">
import { api_fetch, type StudentSubject } from '@/api';
import { useLoginStore } from '@/stores/login';
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const loginStore = useLoginStore();

const subjects = ref<StudentSubject[]>([]);
watch(loginStore, async () => {
    if (loginStore.user === null || loginStore.user.isAdmin) return;
    subjects.value = await api_fetch(`/studentsubjects?StudentId=${loginStore.user.id}`)
        .then(res => res.json())
        .then(res => res.data);
}, { immediate: true });
</script>

<template>
    <div>
        <h3>Všetky predmety</h3>
        <table>
            <tr>
                <th>Názov</th>
                <th>Známka</th>
                <th>Info</th>
            </tr>
            <tr v-for="subject in subjects">
                <td>{{ subject.Subject?.name }}</td>
                <td class="grade">{{ subject.grade }}</td>
                <td class="info-link"><RouterLink :to="`/predmet/${subject.SubjectId}`">
                    <img class="info-icon" src="/circle-info-solid.svg" />
                </RouterLink></td>
            </tr>
        </table>
        <RouterLink class="button-primary predmety-button" to="/predmety">Prihlásenie / Odhlásenie z predmetov</RouterLink>
    </div>
</template>

<style scoped>
td, th {
    padding: 0.1em 0.7em;
    border: 1px solid var(--blue-color);
}

table {
    width: 100%;
    margin-top: 0.5em;
    border-collapse: collapse;
}

th {
    background-color: var(--blue-color);
    color: white;
}

tr:nth-child(odd) {
    background-color: var(--background-blue-color);
}
h3, .grade {
    text-align: center;
}
.info-icon {
    height: 1.1em;
    display: block;
    margin-inline: auto;
}

.predmety-button {
    text-align: center;
    margin-top: 1em;
}
</style>
