<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import LoginInfo from './components/LoginInfo.vue';
import { useLoginStore } from './stores/login';
const login = useLoginStore();
</script>

<template>
    <div class="background"></div>
    <header>
        <div class="logo">
            <img class="logo-img" src="/logo_dark.png"/>
            <div class="logo-text">UMS</div>
        </div>
        <template v-if="login.loggedIn">
            <RouterLink class="hover-underline" to="rozvrh">Rozvrh</RouterLink>
            <LoginInfo />
        </template>
    </header>
    <main>
        <RouterView />
    </main>
</template>

<style scoped>
.background {
    position: fixed;
    z-index: -10;
    background-image: url("/background.jpg");
    background-position: center;
    background-size: cover;
    inset: -20px;
    filter: blur(10px);
}
main {
    width: max-content;
    max-width: 90%;
    margin-inline: auto;
    background-color: white;
    padding: 2em 2em;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 1);
}
header {
    display: flex;
    height: 3em;
    background-color: var(--blue-color);
    margin-bottom: 2em;
    padding-inline: 2em;
    color: white;
    align-items: center;
    gap: 2em;
}
.logo {
    margin-right: auto;
    height: 100%;
    display: flex;
    align-items: center;
}
.logo-img {
    height: 2em;
    margin-right: 10px;
}
.logo-text {
    font-size: 2em;
    font-family: 'Tilt Prism', cursive;
    font-weight: bold;
}

@media only screen and (max-width: 600px) {
    main {
        font-size: 0.6em;
        width: 100%;
        border-radius: 0;
        box-shadow: none;
    }
    .background {
        display: none;
    }
    header {
        margin-bottom: 0;
    }
}
</style>
