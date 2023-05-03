<script setup lang="ts">
import Timetable from "@/components/Timetable.vue";
import { useLoginStore } from "@/stores/login";
import { onMounted, ref } from "vue";

const loginStore = useLoginStore();

const timetableType = ref<'classroom' | 'student' | 'teacher' | null>(null);
const timetableId = ref<number | null>(null);

onMounted(() => {
    if (loginStore.user === null || loginStore.user.isAdmin) {
        timetableType.value = null;
        timetableId.value = null;
        return;
    }
    if (loginStore.user.isTeacher) {
        timetableType.value = 'teacher';
    } else {
        timetableType.value = 'student';
    }
    timetableId.value = loginStore.user.id;
})
</script>

<template>
    <Timetable :type="timetableType" :id="timetableId" />
</template>

<style>
</style>
