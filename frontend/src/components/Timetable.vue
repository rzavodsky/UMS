<script setup lang="ts">
import { api_fetch } from '@/api';
import { computed, ref, watchEffect } from 'vue';

const props = defineProps<{
    classroom?: number,
    teacher?: number,
    student?: number,
}>();

const WEEKDAYS = [
    "Po",
    "Ut",
    "St",
    "Št",
    "Pi",
    "So",
    "Ne",
]
const lessonType = {
    excercise: "Cvičenie",
    lecture: "Prednáška"
}
const WEEKDAY_COUNT = 5
const HOUR_COUNT = 13
const HOUR_START = 7

const lessons = ref<any[]>([]);
const totalLessonLength = computed(() => {
    let total = 0;
    for (const lesson of lessons.value) {
        total += lesson.duration;
    }
    return total;
})

watchEffect(async () => {
    let url;
    if (props.teacher !== undefined) {
        url = `/teachers/${props.teacher}/lessons`;
    } else if (props.student !== undefined) {
        url = `/students/${props.student}/lessons`;
    } else if (props.classroom !== undefined) {
        url = `/classrooms/${props.student}/lessons`;
    } else {
        throw new Error("At least one of the props need to be defined")
    }
    const res = await api_fetch(url);
    if (!res.ok) {
        throw new Error("Timetable fetch failed");
    }
    const body = await res.json()
    lessons.value = body.data;
})

const colors: {[key: number]: string} = {}
function getLessonColor(id: number): string {
    if (colors[id] === undefined) {
        colors[id] = `hwb(${Math.floor(Math.random() * 360)} 60% 0%)`;
    }
    return colors[id];
}
</script>

<template>
    <div class="timetable">
        <div class="heading" />
        <div class="heading weekday" v-for="i in WEEKDAY_COUNT" :style="{'--weekdayIndex': i}" >
            {{WEEKDAYS[i-1]}}
        </div>
        <div class="heading hour" v-for="i in HOUR_COUNT" :style="{ '--hourIndex': i}" >
            {{i + HOUR_START - 1}}:00
        </div>
        <div class="timetable-element timetable-filler" v-for="_ in WEEKDAY_COUNT * HOUR_COUNT - totalLessonLength" />
        <div class="timetable-element lesson" v-for="lesson in lessons" :style="{ '--weekdayIndex': lesson.weekDay + 2,
                                                      '--hourIndex': lesson.hour - HOUR_START + 2,
                                                      '--duration': lesson.duration,
                                                      backgroundColor: getLessonColor(lesson.Subject.id),
                                                      }" >
            <div class="icon" :data-tooltip="lessonType[lesson.type]"><img :src="lesson.type === 'excercise' ? '/flask-solid.svg' : '/bed-solid.svg'"/></div>
            
            <div><strong>{{ lesson.Subject.shortcut }}</strong></div>
            <div>{{lesson.Classroom.name}}</div>
            <div>{{lesson.Teacher.firstName}} {{lesson.Teacher.lastName}}</div>
        </div>
        </div>
</template>

<style scoped>
.timetable {
    display: grid;
    grid-template-columns: min-content repeat(v-bind(HOUR_COUNT), 1fr);
    grid-template-rows: min-content repeat(v-bind(WEEKDAY_COUNT), 1fr);
}
.timetable-element {
    border: 1px solid black;
}

.heading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0.5em;
    overflow: hidden;
}

.heading.weekday {
    grid-column: 1 / 1;
    grid-row: calc(var(--weekdayIndex) + 1) / span 1;
}
.heading.hour {
    grid-row: 1 / 1;
    grid-column: calc(var(--hourIndex) + 1) / span 1;
}

.lesson {
    position: relative;
    grid-row: var(--weekdayIndex) / span 1;
    grid-column: var(--hourIndex) / span var(--duration);
}

.icon {
    position: absolute;
    top: 2px;
    right: 2px;
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
    border: 1px solid black;
    background-color: white;
    width: max-content;
    display: none;
    border-radius: 5px;
}
.icon:hover::after {
    display: block;
}

@media only screen and (max-width: 1000px) {
    .timetable {
        grid-template-rows: min-content repeat(v-bind(HOUR_COUNT), 1fr);
        grid-template-columns: min-content repeat(v-bind(WEEKDAY_COUNT), 1fr);
    }
    .heading.weekday {
        grid-row: 1 / 1;
        grid-column: calc(var(--weekdayIndex) + 1) / span 1;
    }
    .heading.hour {
        grid-column: 1 / 1;
        grid-row: calc(var(--hourIndex) + 1) / span 1;
    }
    .lesson {
        grid-column: var(--weekdayIndex) / span 1;
        grid-row: var(--hourIndex) / span var(--duration);
    }
}
</style>
