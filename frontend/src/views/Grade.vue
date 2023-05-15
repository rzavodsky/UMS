<script setup lang="ts">
import { api_fetch, type StudentSubject, type Subject } from '@/api';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const studsubs = ref<StudentSubject[]>([]);
const subject = ref<Subject>();
const grades = ref<(string | null)[]>([]);
const route = useRoute();
const router = useRouter();

watch(() => route.params, async () => {
    const res = await api_fetch(`/subjects/${route.params.id}`)
    if (res.status === 404) {
        router.push("/404");
        return;
    }
    subject.value = await res.json();

    studsubs.value = await api_fetch(`/studentsubjects?SubjectId=${route.params.id}`)
        .then(res => res.json())
        .then(res => res.data);
    grades.value = studsubs.value.map(studsub => studsub.grade);
}, { immediate: true });

async function submit() {
    const changedIndicies = Array.from(Array(grades.value.length).keys())
        .filter(i => grades.value[i] !== studsubs.value[i].grade);
    if (changedIndicies.length === 0) {
        alert("Neboli vykonané žiadne zmeny");
        return;
    }

    let message = "Naozaj chcete vykonať tieto zmeny?";
    for (const i of changedIndicies) {
        const student = studsubs.value[i].Person;
        const oldGrade = studsubs.value[i].grade ?? "Nehodnotené";
        const newGrade = grades.value[i] ?? "Nehodnotené";
        message += `${"\n"}${student?.firstName} ${student?.lastName} - ${oldGrade} -> ${newGrade}`;
    }
    if (!confirm(message)) return;

    for (const i of changedIndicies) {
        await api_fetch(`/studentsubjects/${studsubs.value[i].id}`, {
            method: "PATCH",
            body: {
                grade: grades.value[i],
            },
        });
    }
    router.push("/");
}
</script>

<template>
    <h3>Hodnotenie predmetu {{subject?.name}}</h3>
    <table>
        <tr>
            <th>ID študenta</th>
            <th>Meno študenta</th>
            <th>Známka</th>
        </tr>
        <tr v-for="studsub, i in studsubs">
            <td>{{studsub.PersonId}}</td>
            <td>{{studsub.Person?.firstName}} {{studsub.Person?.lastName}}</td>
            <td><select class="grade" v-model="grades[i]">
                <option :value="null"></option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>Fx</option>
            </select></td>
        </tr>
    </table>
    <button class="button-primary" @click="submit">Uložiť</button>
</template>

<style scoped>
table {
    margin-block: 1em;
    width: 100%;
    border-collapse: collapse;
}
th {
    background-color: var(--blue-color);
    color: white;
}
tr:nth-child(odd) {
    background-color: var(--background-blue-color);
}
td, th {
    border: 1px solid black;
    padding: 0.2em 0.5em;
}
.grade {
    padding: 0.1em 0.3em;
    margin-inline: auto;
    display: block;
}
button {
    width: 100%;
    font-weight: bold;
}
</style>
