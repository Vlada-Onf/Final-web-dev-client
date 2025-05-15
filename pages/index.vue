<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl space-y-6">
    <!-- КРОКИ -->
    <div class="flex items-center justify-start space-x-2 overflow-x-auto pb-2">
      <template v-for="(step, index) in steps" :key="index">
        <div class="relative group">
          <div
              class="rounded-full bg-blue-600 text-white text-sm px-4 py-2 font-medium whitespace-nowrap flex items-center space-x-1"
          >
            <template v-if="editingIndex === index">
              <input
                  v-model="step.name"
                  @blur="editingIndex = null"
                  @keyup.enter="editingIndex = null"
                  class="bg-transparent border-b border-white focus:outline-none w-full"
              />
            </template>
            <template v-else>
          <span @click="editingIndex = index" class="cursor-pointer">
            {{ step.name }}
          </span>
            </template>

            <!-- Хрестик для видалення -->
            <button
                @click="removeStep(index)"
                class="ml-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Видалити"
            >
              &times;
            </button>
          </div>

          <!-- Стрілка (лінія) після кроку -->
          <div
              v-if="index !== steps.length - 1"
              class="absolute right-[-14px] top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-blue-600"
          ></div>
        </div>
      </template>

      <button
          @click="addStep"
          class="ml-2 flex items-center space-x-1 border border-blue-600 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-50 transition"
      >
        <span class="text-lg leading-none">+</span>
        <span>Додати</span>
      </button>
    </div>


    <!-- ВІДПРАВНИК ТА СПОВІЩЕННЯ -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex-1">
        <label class="block text-sm text-gray-700 mb-1">Від</label>
        <select v-model="sender" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-500">
          <option value="">Оберіть відправника</option>
          <option value="1">Моя компанія</option>
        </select>
      </div>
      <div class="flex items-center mt-2 md:mt-6 space-x-2">
        <input v-model="notifyImmediately" type="checkbox" id="notify" class="accent-blue-600" />
        <label for="notify" class="text-sm text-gray-700">Надіслати сповіщення одержувачу негайно</label>
      </div>
    </div>

    <!-- КОМУ -->
    <div class="border rounded-lg overflow-hidden">
      <div class="grid grid-cols-4 bg-gray-50 text-sm font-semibold text-gray-700 px-4 py-2 border-b">
        <div>Кому</div>
        <div>Email</div>
        <div>Дія</div>
        <div>Посада</div>
      </div>
      <div
          v-for="(recipient, i) in recipients"
          :key="i"
          class="grid grid-cols-4 gap-2 px-4 py-2 border-b bg-white"
      >
        <input
            v-model="recipient.name"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Ім'я"
        />
        <input
            v-model="recipient.email"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
        />
        <select v-model="recipient.action" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>На підпис</option>
          <option>На печатку</option>
          <option>Підпис і печатка</option>
          <option>На узгодження</option>
          <option>Для перегляду</option>
        </select>
        <select v-model="recipient.position" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Не вказано</option>
          <option>Ректор</option>
          <option>Директор</option>
          <option>Викладач</option>
          <option>Лаборант</option>
        </select>
      </div>
    </div>


    <!-- КНОПКИ -->
    <div class="flex flex-wrap items-center justify-between pt-6 gap-4 border-t">
      <button class="flex items-center space-x-2 px-4 py-2 text-sm text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Зберегти як шаблон</span>
      </button>

      <div class="flex space-x-2">
        <button
            @click="addRecipient"
            class="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 106 0 3 3 0 00-6 0z" />
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 4a4 4 0 100-8 4 4 0 000 8z" clip-rule="evenodd" />
          </svg>
          <span>Додати одержувача</span>
        </button>

        <button
            @click="sendDocument"
            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Відправити
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const steps = ref([{ name: 'Крок 1' }, { name: 'Крок 2' }])
const recipients = ref([
  { name: '', email: '', action: 'На підпис', position: 'Не вказано' }
])
const sender = ref('')
const notifyImmediately = ref(false)
const editingIndex = ref(null);

function addStep() {
  steps.value.push({ name: `Крок ${steps.value.length + 1}` })
}

function addRecipient() {
  recipients.value.push({
    name: '',
    email: '',
    action: 'На підпис',
    position: 'Не вказано'
  })
}

function removeStep(index) {
  steps.value.splice(index, 1);
}

function sendDocument() {
  // Here you would typically handle the actual sending logic
  // For now, we'll just clear the recipient fields as requested

  // Reset all recipients to have empty name and email fields
  recipients.value.forEach(recipient => {
    recipient.name = '';
    recipient.email = '';
  });

  // Alternatively, you could reset to just one empty recipient:
  // recipients.value = [{ name: '', email: '', action: 'На підпис', position: 'Не вказано' }];

  // Optional: Show a confirmation message
  alert('Документ відправлено!');
}
</script>

<style scoped>
</style>
