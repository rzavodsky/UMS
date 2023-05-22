<script setup lang="ts">
import { api_fetch } from '@/api';
import { resources, type OtherData, type Resource } from '@/resources';
import { ref, watch } from 'vue';

const props = defineProps<{
    resource: string | number,
    id: number | null,
    otherData: OtherData,
}>();
const emit = defineEmits(["close"]);
const resource = ref<Resource>();
const datum = ref<any>({});

watch(props, async () => {
    datum.value = {};
    resource.value = resources[props.resource];
    if (props.id === null) return;

    const res = await api_fetch(resource.value!.endpoint + "/" + props.id)
        .then(res => res.json());
    for (const field of resource.value.fields.filter(x => !x.constant)) {
        datum.value[field.key] = res[field.key];
    }

}, { immediate: true });

async function save() {
    for (const field of resource.value!.fields) {
        if (field.constant) continue;
        if (datum.value[field.key] === "" || datum.value[field.key] === undefined) {
            alert(`${field.name} musí mať nejakú hodnotu`);
            console.log(datum.value[field.key]);
            return;
        }
        if (field.type === "number") {
            if (field.max !== undefined && datum.value[field.key] > field.max) {
                alert(`${field.name} nemôže byť viac ako ${field.max}`);
                return;
            }
            if (field.min !== undefined && datum.value[field.key] < field.min) {
                alert(`${field.name} nemôže byť menej ako ${field.min}`);
                return;
            }
        }
    }
    if (props.id !== null) {
        const res = await api_fetch(resource.value!.endpoint + "/" + props.id, {
            method: "PATCH",
            body: datum.value,
        });
        if (!res.ok) {
            alert("Niečo sa pokazilo");
        }
    } else {
        const res = await api_fetch(resource.value!.endpoint, {
            method: "POST",
            body: datum.value,
        });
        if (!res.ok) {
            alert("Niečo sa pokazilo");
        }
    }
    emit('close');
}
</script>

<template>
    <div class="background" @click="emit('close')"></div>
    <div class="modal">
        <h3 class="title">{{props.id === null ? "Pridať" : "Upraviť"}} {{resource.name}}</h3>
        <div class="inputs">
            <div v-for="field in resource.fields.filter(x => !x.constant)" class="field">
                {{field.name}}
                <input v-if="field.type === undefined || field.type === 'string'" v-model.trim="datum[field.key]">
                <input v-else-if="field.type === 'number'" v-model="datum[field.key]" type="number" :min="field.min" :max="field.max">
                <input v-else-if="field.type === 'date'" v-model="datum[field.key]" type="date">
                <select v-else-if="field.type === 'choice'" v-model="datum[field.key]">
                    <option v-for="choiceName, choice in field.choices" :value="choice">{{choiceName}}</option>
                </select>
                <select v-else-if="field.type === 'foreignKey'" v-model="datum[field.key]">
                    <template v-for="otherDatum in props.otherData[field.foreignResource]">
                        <option v-if="otherDatum !== undefined" :value="otherDatum.id">{{ resources[field.foreignResource].display(otherDatum) }}</option>
                    </template>
                </select>
            </div>
        </div>
        <div class="buttons">
            <button @click="save" class="button-primary">Uložiť</button>
            <button @click="emit('close')" class="button-secondary">Zrušiť</button>
        </div>
    </div>
</template>

<style scoped>
.background {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
}
.modal {
    position: fixed;
    background: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 10px;
    width: 40em;
}
.title {
    text-align: center;
}
.inputs {
    margin-bottom: 1em;
}
.field {
    margin-top: 0.5em;
}
.field :is(input, select) {
    display: block;
    width: 100%;
    padding: 0.2em 0.5em;
    border: 1px solid var(--blue-color);
    border-radius: 3px;
}
.buttons {
    display: flex;
    gap: 1em;
}
.buttons button {
    flex-grow: 1;
}
</style>
