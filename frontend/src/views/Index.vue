<script setup lang="ts">
import { useLoginStore } from '@/stores/login';
import { watch, shallowRef, type Component } from 'vue';
import { useRouter } from 'vue-router';

const loginStore = useLoginStore();
const component = shallowRef<Component | null>(null);
const router = useRouter();

watch(loginStore, async () => {
    if (loginStore.user?.isAdmin) {
        component.value = await import("@/views/Admin.vue").then(comp => comp.default);
    } else if (loginStore.user !== null) {
        component.value = await import("@/views/UserHome.vue").then(comp => comp.default);
    } else {
        router.push({ name: 'login' });
    }
}, { immediate: true });
</script>

<template>
    <component v-if="component != null" :is="component" />
    <div v-else class="loadingIcon" />
</template>

<style>
.loadingIcon {
    border-radius: 100%;
    aspect-ratio: 1 / 1;
    width: 5em;
    border: 5px solid #DDDDDD;
    border-right: 5px solid black;
    animation: rotation 1s linear 0s infinite;
}
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
