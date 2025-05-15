<template>
  <div>
    <template v-for="(step, index) in steps" :key="index">
      <div>
        <template v-if="editingIndex === index">
          <input
              v-model="steps[index].name"
              @blur="stopEditing"
              @keyup.enter="stopEditing"
          />
        </template>
        <template v-else>
          <span @click="startEditing(index)" style="cursor: pointer;">
            {{ step.name }}
          </span>
        </template>
        <button @click="removeStep(index)" title="Видалити">×</button>
      </div>
    </template>

    <button @click="addStep">Додати</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const steps = ref([{ name: 'Крок 1' }, { name: 'Крок 2' }])
const editingIndex = ref(null)

function startEditing(index) {
  editingIndex.value = index
}

function stopEditing() {
  editingIndex.value = null
}

function addStep() {
  steps.value.push({ name: `Крок ${steps.value.length + 1}` })
}

function removeStep(index) {
  steps.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  }
}
</script>
