<script setup lang="ts">
import Timetable from "@/components/Timetable.vue";
import { useLoginStore, type StudentUser } from "@/stores/login";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const login = useLoginStore();
const user = computed(() => {
    const { user } = storeToRefs(login);
    if (user.value === null || user.value.isAdmin || user.value.isTeacher) {
        throw new Error("Only students can access Student view");
    }
    return user.value as StudentUser;
});
</script>

<template>
    <Timetable :student="user.id" />
</template>
