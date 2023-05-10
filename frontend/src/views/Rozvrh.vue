<script setup lang="ts">
import { api_fetch } from "@/api";
import Timetable from "@/components/Timetable.vue";
import { useLoginStore } from "@/stores/login";
import { ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

const loginStore = useLoginStore();
const route = useRoute();
const router = useRouter();

const timetableType = ref<'classroom' | 'student' | 'teacher' | null>(null);
const timetableId = ref<number | null>(null);
const searchTerm = ref("");
const searchType = ref<'classroom' | 'student' | 'teacher' | null>(null);

type SearchItem = {
    id: number,
    key: string,
}
const searchList: { [key: string]: SearchItem[]} = {}

const suggestions = ref<SearchItem[]>([]);

watch(searchType, async () => {
    if (searchType.value === null) return;
    searchTerm.value = '';
    if (searchList[searchType.value] !== undefined) return;

    const res = await api_fetch(`/${searchType.value}s`);
    const json = await res.json();
    searchList[searchType.value] = json.data.map((res: any) => {return {
        id: res.id,
        key: searchType.value === 'classroom' ? res.name : `${res.firstName} ${res.lastName}`,
    }})
});

watch(searchTerm, () => {
    if (searchType.value === null) return;
    if (searchTerm.value.trim() === "") {
        suggestions.value = [];
        return;
    }
    const term = searchTerm.value.toLowerCase();
    suggestions.value = searchList[searchType.value]
        .filter((item) => item.key.toLowerCase().includes(term));
});

watch(() => route.params, () => {
    if (route.params.type !== "" && route.params.id === "") {
        router.push("/rozvrh");
        return;
    }
    if (route.params.type !== "") {
        timetableType.value = route.params.type as any;
        timetableId.value = Number(route.params.id);
        return;
    }

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
}, { immediate: true });

function submitSearch(suggestion?: SearchItem) {
    if (suggestions.value.length === 0) return;
    if (suggestion === undefined) {
        suggestion = suggestions.value[0];
    }
    searchTerm.value = suggestion.key;
    nextTick(() => suggestions.value = []);
    router.push(`/rozvrh/${searchType.value}/${suggestion.id}`)
}
</script>

<template>
    <div class="search-container" :class="{'suggestions-enabled': suggestions.length !== 0}">
        <select class="dropdown" v-model="searchType">
            <option value="student">Študent</option>
            <option value="teacher">Učiteľ</option>
            <option value="classroom">Učebňa</option>
        </select>
        <input class="search" v-model="searchTerm" placeholder="Vyhľadávanie" @keydown.enter="submitSearch()" @focusout="suggestions = []" />
        <div class="suggestions">
            <div v-for="suggestion in suggestions" class="suggestion" @click="submitSearch(suggestion)" >
                {{suggestion.key}}
            </div>
        </div>
    </div>
    <Timetable :type="timetableType" :id="timetableId" />
</template>

<style scoped>
.search-container {
    margin-bottom: 1em;
    margin-inline: auto;
    width: min-content;
    display: grid;
    grid-template-areas: "dropdown    input"
                         "suggestions suggestions";
    --border: 1px solid #888888; 
}

.dropdown {
    background-color: inherit;
    border: var(--border);
    height: 100%;
    display: block;
    padding: 0.2em 0.5em;
    border-radius: 5px 0 0 5px;
    grid-area: dropdown;
    width: max-content;
}
.search {
    display: block;
    height: 100%;
    border: var(--border);
    border-left: none;
    padding: 0.2em 0.5em;
    border-radius: 0 5px 5px 0;
    width: 20em;
    grid-area: input;
}
.suggestions {
    grid-area: suggestions;
    border: var(--border);
    border-top: none;
    display: none;
    border-radius: 0 0 5px 5px;
}
.suggestion {
    display: block;
    padding: 0 0.2em;
    border-bottom: var(--border);
}
.suggestion:last-child {
    border-bottom: none;
}
.suggestion:hover {
    background-color: var(--background-blue-color);
}

.suggestions-enabled .suggestions {
    display: block;
}
.suggestions-enabled .search {
    border-bottom-right-radius: 0;
}
.suggestions-enabled .dropdown {
    border-bottom-left-radius: 0;
}
</style>
