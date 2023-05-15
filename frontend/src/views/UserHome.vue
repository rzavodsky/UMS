<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { api_fetch , type Lesson, type Student, type Teacher } from "@/api";
import { useLoginStore} from "@/stores/login";
import TodayLessonList from "@/components/TodayLessonList.vue";
import StudentSubjectList from "@/components/StudentSubjectList.vue"
import TeacherSubjectList from "@/components/TeacherSubjectList.vue"

const login = useLoginStore();
const user = computed(() => {
    const { user } = storeToRefs(login);
    if (user.value === null || user.value.isAdmin) {
        throw new Error("Only students and teachers can access this view");
    }
    return user.value as Student | Teacher;
});

const lessons = ref<Lesson[]>([]);
watch(user, async () => {
    const url = user.value.isTeacher ? '/teachers' : '/students'
    lessons.value = await api_fetch(`${url}/${user.value.id}/lessons`)
        .then(res => res.json())
        .then(res => res.data);
}, { immediate: true });

const todayLessons = computed(() => {
    const weekDay = new Date().getDay() - 1 % 7;
    return lessons.value
        .filter(lesson => lesson.weekDay === weekDay)
        .sort((a, b) => a.hour - b.hour);
});

const nextLesson = computed(() => {
    const currentHour = new Date().getHours();
    return todayLessons.value
        .find(lesson => lesson.hour + lesson.duration > currentHour) ?? null;
});
</script>

<template>
    <div class="main-container">
        <div v-if="nextLesson !== null" class="next-lesson">
            <h3>Nasledujúca hodina</h3>
            {{nextLesson.Subject?.name}} od {{nextLesson.hour}}:00 do {{nextLesson.hour + nextLesson.duration}}:00 v {{nextLesson.Classroom?.name}}
        </div>

        <TodayLessonList class="today-lesson-list" :todayLessons="todayLessons" />

        <StudentSubjectList v-if="!user.isTeacher" class="all-subjects" />
        <TeacherSubjectList v-else class="all-subjects" />
    </div>
</template>

<style scoped>
.main-container {
    display: grid;
    grid-template: "a a" "b c";
    grid-template-columns: 1fr 1fr;
    justify-items: center;
    gap: 2em;
}
.next-lesson {
    grid-area: a;
    text-align: center;
}
.today-lesson-list {
    width: 100%;
    grid-area: b;
}
.all-subjects {
    grid-area: c;
}
@media only screen and (max-width: 600px) {
    .main-container {
        grid-template: "a" "b" "c";
    }
}
</style>
