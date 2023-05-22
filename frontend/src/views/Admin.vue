<script setup lang="ts">
import { api_fetch } from '@/api';
import { ref, watch } from 'vue';
import { resources, displayField, getOtherResources, type OtherData } from '@/resources';
import AdminEdit from '@/components/AdminEdit.vue';

const selected = ref<string | number>("countries");
const data = ref<any[]>([]);
const otherData = ref<OtherData>({});

const modalEnabled = ref(false);
const currentEditId = ref<number | null>(0);

watch(selected, refresh, { immediate: true });

async function refresh() {
    data.value = [];
    otherData.value = {};
    const resource = resources[selected.value];

    await Promise.all(getOtherResources(selected.value).map(async resourceName => {
        const resource = resources[resourceName]
        otherData.value[resourceName] = [];
        const data = await api_fetch(resource.endpoint)
            .then(res => res.json())
            .then(res => res.data);
        for (const datum of data) {
            otherData.value[resourceName][datum.id] = datum;
        }
    }));

    data.value = await api_fetch(resource.endpoint)
        .then(res => res.json())
        .then(res => res.data);
}

async function deleteDatum(id: number) {
    if (!confirm("Naozaj chcete vymazať tento údaj?")) return;
    await api_fetch(resources[selected.value].endpoint + "/" + id, {
        method: 'DELETE',
    })
    await refresh();
}

async function editDatum(id: number) {
    currentEditId.value = id;
    modalEnabled.value = true;
}

async function addDatum() {
    currentEditId.value = null;
    modalEnabled.value = true;
}
</script>

<template>
    <div class="tablist">
        <div v-for="resource, resourceName in resources" class="tab" :class="{selected: selected === resourceName}"
             @click="selected = resourceName">{{resource.name}}</div>
    </div>
    <div class="table-container">
        <table>
            <tr>
                <th v-for="field in resources[selected].fields.filter(x => !x.hidden)">{{ field.name }}</th>
                <th></th>
                <th></th>
            </tr>
            <tr v-for="datum in data">
                <td v-for="field in resources[selected].fields.filter(x => !x.hidden)">
                    {{ displayField(field, datum, otherData) }}
                </td>
                <td class="button-cell">
                    <button @click="editDatum(datum.id)"><img class="icon" src="/pen-to-square-solid.svg" title="Upraviť" /></button>
                </td>
                <td class="button-cell">
                    <button @click="deleteDatum(datum.id)"><img class="icon" src="/trash-can-solid.svg" title="Vymazať" /></button>
                </td>
            </tr>
        </table>
        <button class="button-primary add-button" @click="addDatum">Pridať</button>
    </div>
    <AdminEdit v-if="modalEnabled" :resource="selected" :id="currentEditId" :otherData="otherData" @close="modalEnabled = false; refresh();" />
</template>

<style scoped>
.tablist {
    display: flex;
    gap: 0.5em;
    overflow-y: scroll;
}
.tab {
    border: 1px solid var(--blue-color);
    border-radius: 5px;
    padding: 0.2em 0.5em;
    cursor: pointer;
}
.selected {
    background-color: var(--blue-color);
    color: white;
    font-weight: bold;
}
.table-container {
    overflow-y: scroll;
}
table {
    margin-top: 1em;
    min-width: 100%;
    border-collapse: collapse;
}
th, td {
    border: 1px solid var(--blue-color);
    padding: 0.2em 0.5em;
}
th {
    color: white;
    background-color: var(--blue-color);
}
.add-button {
    margin-top: 0.5em;
    width: 100%;
}
.button-cell {
    width: 0;
}
.button-cell img {
    height: 1.5em;
    display: block;
}
.button-cell button {
    margin-inline: auto;
    cursor: pointer;
    border: none;
    padding: none;
    margin: none;
    background: transparent;
    display: block;
}
</style>
