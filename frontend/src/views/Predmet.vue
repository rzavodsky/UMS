<script setup lang="ts">
import { api_fetch, type StudentSubject, type Subject, type ResponseList } from '@/api';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Grade {
    grade: string,
    percentage: number,
}

const route = useRoute();
const router = useRouter();
const subject = ref<Subject | null>(null);
const grades = ref<Grade[] | null>(null);
const totalGraded = ref<number>(0);

watch(() => route.params, async () => {
    subject.value = null;
    let res = await api_fetch(`/subjects/${route.params.id}`);
    if (res.status === 404) {
        router.push("/404");
        return;
    }
    subject.value = await res.json();

    res = await api_fetch(`/studentsubjects?SubjectId=${route.params.id}`);
    const json = await res.json() as ResponseList<StudentSubject>;
    const allGraded = json.data.filter(studsub => studsub.grade !== null);
    totalGraded.value = allGraded.length;
    if (allGraded.length > 0) {
        grades.value = ['A', 'B', 'C', 'D', 'E', 'Fx'].map(grade => {
            return {
                grade,
                percentage: allGraded.filter(studsub => studsub.grade === grade).length / allGraded.length * 100,
            }
        });
    }
}, { immediate: true });
</script>

<template>
    <h3>Informačný list predmetu</h3>
    <template v-if="subject == null">
        Loading...
    </template>
    <table v-else>
        <tr>
            <th>Číslo</th>
            <td>{{subject.id}}</td>
        </tr>
        <tr>
            <th>Názov</th>
            <td>{{subject.name}}</td>
        </tr>
        <tr>
            <th>Týždenný počet hodín</th>
            <td>Prednášky: {{subject.lectureAmount}}<br/>Cvičenia: {{subject.excerciseAmount}}</td>
        </tr>
        <tr>
            <th>Počet kreditov</th>
            <td>{{subject.credits}}</td>
        </tr>
        <tr>
            <th>Odporúčaný semester štúdia</th>
            <td>{{subject.semester}}</td>
        </tr>
        <tr>
            <th>Popis predmetu</th>
            <td>{{subject.description}}</td>
        </tr>
        <template v-if="grades != null">
        <tr>
            <th colspan="2">Hodnotenie predmetu</th>
        </tr>
        <tr>
            <td colspan="2">Celkový počet hodnotených študentov: {{totalGraded}}
                <table class="gradeTable">
                    <tr><th v-for="grade in grades">{{grade.grade}}</th></tr>
                    <tr><td v-for="grade in grades">{{grade.percentage}}%</td></tr>
                </table>
            </td>
        </tr>
        </template>
    </table>
</template>

<style scoped>
h3 {
    margin-bottom: 1em;
}
table {
    border-collapse: collapse;
}
th, td {
    border: 1px solid var(--blue-color);
    padding: 0.2em 0.5em;
    text-align: left;
}
.gradeTable {
    margin-top: 0.5em;
    width: 100%;
}
.gradeTable :is(td, th) {
    text-align: center;
}
</style>
