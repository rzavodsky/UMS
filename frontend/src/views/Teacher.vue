<script setup lang="ts">
import { useLoginStore, type TeacherUser } from '@/stores/login';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const login = useLoginStore();
const user = computed(() => {
    const { user } = storeToRefs(login);
    if (user.value === null || user.value.isAdmin || !user.value.isTeacher) {
        throw new Error("Only teachers can access Teacher view");
    }
    return user.value as TeacherUser;
});
</script>

<template>
    Hello Teacher {{user.firstName}} {{user.lastName}}
</template>
