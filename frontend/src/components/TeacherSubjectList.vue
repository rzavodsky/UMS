<script setup lang="ts">
import { api_fetch, type Subject } from '@/api';
import { useLoginStore } from '@/stores/login';
import { RouterLink } from 'vue-router';
import { ref, watch } from 'vue';

const loginStore = useLoginStore();

type CountedSubject = Subject & { ungradedStudentCount: number };
const subjects = ref<CountedSubject[]>([]);
watch(loginStore, async () => {
    if (loginStore.user === null || loginStore.user.isAdmin) return;
    subjects.value = await api_fetch(`/teachers/${loginStore.user.id}/subjects`)
        .then(res => res.json())
        .then(res => res.data);
}, { immediate: true })
</script>

<template>
    <div>
        <h3>Všetky predmety</h3>
        <table>
            <tr>
                <th>Názov</th>
                <th>Počet neohodnotených</th>
                <th></th>
            </tr>
            <tr v-for="subject in subjects">
                <td>{{subject.name}}</td>
                <td>{{subject.ungradedStudentCount}}</td>
                <td><RouterLink :to="`/grade/${subject.id}`"><img class="grade-icon" src="/pen-to-square-solid.svg" title="Hodnotiť" /></RouterLink></td>
            </tr>
        </table>
    </div>
</template>

<style scoped>
td, th {
    padding: 0.1em 0.7em;
    border: 1px solid black;
}
.grade-icon {
    height: 1.1em;
    display: block;
    margin-inline: auto;
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
h3 {
    text-align: center;
}
</style>
