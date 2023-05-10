<script setup lang="ts">
import { api_fetch } from '@/api';
import { useLoginStore } from '@/stores/login';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Subject {
    id: number,
    name: string,
    credits: number,
    lectureAmount: number,
    excerciseAmount: number,
    semester: number,
}

const loginStore = useLoginStore();
const router = useRouter();

const subjects = ref<Subject[]>([]);
const initialSignedUpIds: number[] = [];
const signedUpIds = ref<number[]>([]);


onMounted(async () => {
    if (loginStore.user === null || loginStore.user.isAdmin || loginStore.user.isTeacher) {
        throw Error("Only students can access the subject list");
    }
    let res = await api_fetch("/subjects");
    let json = await res.json();

    for (const subject of json.data) {
        subjects.value.push({
            id: subject.id,
            name: subject.name,
            credits: subject.credits,
            lectureAmount: subject.lectureAmount,
            excerciseAmount: subject.excerciseAmount,
            semester: subject.semester,
        })
    }

    res = await api_fetch(`/studentsubjects?StudentId=${loginStore.user.id}`)
    json = await res.json();
    for (const studsub of json.data) {
        signedUpIds.value.push(studsub.SubjectId);
        initialSignedUpIds.push(studsub.SubjectId);
    }
});

async function submit() {
    const removed = initialSignedUpIds.filter(x => !signedUpIds.value.includes(x));
    const added = signedUpIds.value.filter(x => !initialSignedUpIds.includes(x));
    if (added.length == 0 && removed.length == 0) {
        alert("Neboli vykonané žiadne zmeny");
        return;
    }
    const removedNames = removed.map(id => subjects.value.find(x => x.id == id)?.name);
    const addedNames = added.map(id => subjects.value.find(x => x.id == id)?.name);
    let message = "Naozaj sa chcete ";
    if (added.length > 0) {
        message += "prihlásiť na tieto predmety:\n";
        for (const name of addedNames) {
            message += name + "\n";
        }
    }
    if (added.length > 0 && removed.length > 0) {
        message += "\na ";
    }
    if (removed.length > 0) {
        message += "odhlásiť z týchto predmetov:\n";
        for (const name of removedNames) {
            message += name + "\n";
        }
    }
    if (!confirm(message)) {
        return;
    }
    let studsub = null;
    if (removed.length > 0) {
        const res = await api_fetch(`/studentsubjects?StudentId=${loginStore.user.id}`);
        const json = await res.json();
        studsub = json.data;
    }
    for (const subjectId of added) {
        await api_fetch("/studentsubjects", {
            method: "POST",
            body: {
                "SubjectId": subjectId,
                "StudentId": loginStore.user.id,
            }
        })
    }
    for (const subjectId of removed) {
        const studsubId = studsub.find(x => x.SubjectId == subjectId).id;
        await api_fetch(`/studentsubjects/${studsubId}`, {
            method: "DELETE",
        });
    }
    router.push("/");
}
</script>

<template>
    <h3 class="title">Zoznam predmetov</h3>
    <table>
        <tr>
            <th>Názov</th>
            <th>Semester</th>
            <th>Počet kreditov</th>
            <th>Hodiny za týždeň</th>
            <th>Info</th>
            <th>Prihlásený</th>
        </tr>
        <tr v-for="subject in subjects">
            <td>{{subject.name}}</td>
            <td class="center">{{subject.semester}}</td>
            <td class="center">{{subject.credits}}</td>
            <td class="center">{{subject.lectureAmount}}-{{subject.excerciseAmount}}</td>
            <td><RouterLink :to="`/predmet/${subject.id}`"><img class="info-icon" src="/circle-info-solid.svg"></RouterLink></td>
            <td><input type="checkbox" :value="subject.id" v-model="signedUpIds" /></td>
        </tr>
    </table>
    <button class="button-primary submit-button" @click="submit">Submit</button>
</template>

<style scoped>
.title {
    text-align: center;
    margin-bottom: 1em;
}
.center {
    text-align: center;
}
.info-icon {
    display: block;
    height: 1.3em;
    margin-inline: auto;
}

table {
    border-collapse: collapse;
}

th, td {
    border: 1px solid black;
    padding: 0.2em 0.5em;
}

th {
    color: white;
    background: var(--blue-color);
}
.submit-button {
    width: 100%;
    margin-top: 1em;
    font-weight: bold;
}
</style>
