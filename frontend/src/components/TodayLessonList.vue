<script setup lang="ts">
import type { Lesson } from '@/api';
import { computed } from 'vue';

const props = defineProps<{
    todayLessons: Lesson[]
}>();

const lessonType = {
    excercise: "Cvičenie",
    lecture: "Prednáška"
}

const todayLessonLength = computed(() => {
    return props.todayLessons.reduce((acc, x) => acc + x.duration, 0);
});
</script>

<template>
    <div class="container">
        <h3 class="title">Dnešný rozvrh</h3>
        <div v-for="hour in 13" class="hour-label">{{hour+6}}:00</div>
        <div v-for="_ in 13 - todayLessonLength" class="filler"></div>
        <div v-for="lesson in props.todayLessons" class="lesson" :style="{
                                                                 '--index': lesson.hour - 5,
                                                                 '--duration': lesson.duration }">
            <div><strong>{{lesson.Subject!.shortcut}}</strong></div>
            <div>{{lesson.Classroom!.name}}</div>
            <div class="icon" :data-tooltip="lessonType[lesson.type]"><img :src="lesson.type === 'excercise' ? '/flask-solid.svg' : '/bed-solid.svg'"/></div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: grid;
    grid-template-columns: min-content auto;
    grid-template-rows: min-content repeat(13, 1fr);
    grid-auto-flow: column;
    border-bottom: 1px dashed black;
    justify-items: center;
}
.title {
    grid-column: 1 / span 2;
    padding-bottom: 0.5em;
}
.hour-label {
    font-size: 0.8em;
    grid-column: 1;
    text-align: right;
    padding: 0.2em 0.5em;
}
.filler, .lesson {
    grid-column: 2;
}
.filler, .lesson, .hour-label {
    width: 100%;
    border-top: 1px dashed black;
}
.lesson {
    grid-row: var(--index) / span var(--duration);
    border: 2px solid var(--blue-color);
    border-radius: 5px;
    padding: 0.4em;
    position: relative;
    background-color: var(--background-blue-color);
}

.icon {
    position: absolute;
    top: 2px;
    right: 5px;
    height: 0.8em;
}
.icon img {
    height: 100%;
}

.icon::after {
    position: absolute;
    bottom: -0.2em;
    padding: 0.1em 0.3em;
    transform: translateY(100%);
    content: attr(data-tooltip);
    border: 1px solid var(--blue-color);
    background-color: white;
    width: max-content;
    display: none;
    border-radius: 5px;
}
.icon:hover::after {
    display: block;
}
</style>
