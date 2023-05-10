<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { RouterLink } from 'vue-router';
import { api_fetch } from "@/api";
import { useLoginStore, type StudentUser } from "@/stores/login";
import TodayLessonList from "@/components/TodayLessonList.vue";

const login = useLoginStore();
const user = computed(() => {
    const { user } = storeToRefs(login);
    if (user.value === null || user.value.isAdmin || user.value.isTeacher) {
        throw new Error("Only students can access Student view");
    }
    return user.value as StudentUser;
});

const lessons = ref<any[]>([]);
watch(user, async () => {
    const res = await api_fetch(`/students/${user.value.id}/lessons`);
    const body = await res.json();
    lessons.value = body.data;
}, { immediate: true });

const todayLessons = computed(() => {
    const todayLes = [];
    const weekDay = new Date().getDay() - 1 % 7;
    for (const lesson of lessons.value) {
        if (lesson.weekDay == weekDay) {
            todayLes.push(lesson);
        }
    }
    todayLes.sort((a: any, b: any): number => {
        return a.hour - b.hour;
    })
    return todayLes;
});

const nextLesson = computed(() => {
    const currentHour = new Date().getHours();

    for (const lesson of todayLessons.value) {
        if (lesson.hour + lesson.duration > currentHour) {
            return lesson;
        }
    }
    return null;
});

const subjects = ref<any[]>([]);
watch(user, async () => {
    const res = await api_fetch(`/studentsubjects?StudentId=${user.value.id}`);
    const body = await res.json();
    subjects.value = body.data;
}, { immediate: true });
</script>

<template>
    <div class="main-container">
        <div v-if="nextLesson != null" class="next-lesson">
            <h3>Nasledujúca hodina</h3>
            {{nextLesson.Subject.name}} od {{nextLesson.hour}}:00 do {{nextLesson.hour + nextLesson.duration}}:00 v {{nextLesson.Classroom.name}}
        </div>

        <TodayLessonList class="today-lesson-list" :todayLessons="todayLessons" />

        <div class="all-subjects">
            <h3>Všetky predmety</h3>
            <table>
                <tr>
                    <th>Názov</th>
                    <th>Známka</th>
                    <th>Info</th>
                </tr>
                <tr v-for="subject in subjects">
                    <td>{{subject.Subject.name}}</td>
                    <td class="grade">{{subject.grade}}</td>
                    <td class="info-link"><RouterLink :to="`/predmet/${subject.id}`">
                        <img class="info-icon" src="/circle-info-solid.svg" />
                    </RouterLink></td>
                </tr>
            </table>
            <RouterLink class="button-primary predmety-button" to="/predmety">Prihlásenie / Odhlásenie z predmetov</RouterLink>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    display: grid;
    grid-template: "a a" "b c";
    grid-template-columns: 1fr 1fr;
    gap: 2em;
}
.next-lesson {
    grid-area: a;
}
.today-lesson-list {
    grid-area: b;
}
.all-subjects {
    grid-area: c;
}

h3, .grade {
    text-align: center;
}

.info-icon {
    height: 1.1em;
    display: block;
    margin-inline: auto;
}

.all-subjects :is(td, th) {
    padding: 0.1em 0.7em;
    border: 1px solid black;
}

.all-subjects table {
    width: 100%;
    margin-top: 0.5em;
    border-collapse: collapse;
}

.all-subjects th {
    background-color: var(--blue-color);
    color: white;
}

.all-subjects tr:nth-child(odd) {
    background-color: var(--background-blue-color);
}

.predmety-button {
    text-align: center;
    margin-top: 1em;
}

@media only screen and (max-width: 600px) {
    .main-container {
        grid-template: "a" "b" "c";
    }
}
</style>
