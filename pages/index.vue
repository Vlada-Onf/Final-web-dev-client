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
  <div>
    <!-- Відправник -->
    <div>
      <label for="sender">Від</label>
      <select id="sender" v-model="sender">
        <option value="">Оберіть відправника</option>
        <option value="1">Моя компанія</option>
      </select>
    </div>

    <!-- Сповіщення -->
    <div>
      <input type="checkbox" id="notify" v-model="notifyImmediately" />
      <label for="notify">Надіслати сповіщення одержачу негайно</label>
    </div>

    <!-- Одержувачі -->
    <div>
      <div>
        <div>Кому</div>
        <div>Email</div>
        <div>Дія</div>
        <div>Посада</div>
      </div>

      <div v-for="(recipient, i) in recipients" :key="i">
        <input v-model="recipient.name" placeholder="Ім'я" />
        <input v-model="recipient.email" placeholder="Email" type="email" />
        <select v-model="recipient.action">
          <option>На підпис</option>
          <option>На печатку</option>
          <option>Підпис і печатка</option>
          <option>На узгодження</option>
          <option>Для перегляду</option>
        </select>
        <select v-model="recipient.position">
          <option>Не вказано</option>
          <option>Ректор</option>
          <option>Директор</option>
          <option>Викладач</option>
          <option>Лаборант</option>
        </select>
      </div>
    </div>
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
const sender = ref('')
const notifyImmediately = ref(false)
const recipients = ref([
  { name: '', email: '', action: 'На підпис', position: 'Не вказано' }
])
</script>
