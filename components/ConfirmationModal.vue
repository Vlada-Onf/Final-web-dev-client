<template>
  <UModal
      v-model:open="isModalOpen"
      :title="title"
      :prevent-close="currentState === 'loading'"
  >
    <UButton label="Редагувати маршрут" color="neutral" variant="subtle" />

    <template #body>
      <div v-if="currentState === 'confirm'" class="sm:flex sm:items-start">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
          <UIcon name="i-heroicons-pencil-square" class="h-6 w-6 text-blue-600" />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium">
            Ви впевнені, що хочете зберегти зміни до маршруту?
          </h3>
          <div class="mt-2">
            <p class="text-sm">
              Після збереження зміни буде застосовано до поточного маршруту.
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="currentState === 'loading'" class="text-center py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-12 w-12  mx-auto" />
        <p class="mt-4 text-lg">Збереження змін...</p>
      </div>

      <div v-else-if="currentState === 'success'" class="text-center py-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <UIcon name="i-heroicons-check" class="h-6 w-6 text-green-600" />
        </div>
        <h3 class="mt-4 text-lg font-medium">Маршрут успішно відредаговано!</h3>
      </div>

      <div v-else-if="currentState === 'error'" class="text-center py-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="mt-4 text-lg font-medium">Помилка!</h3>
        <p class="mt-1 text-sm">Будь ласка, спробуйте пізніше.</p>
        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
      </div>
    </template>

    <template #footer>
      <UButton
          v-if="currentState === 'confirm'"
          color="error"
          variant="outline"
          size="xl"
          class="min-w-[100px] text-center justify-center"
          @click="close"
          label="Ні"
      />
      <UButton
          v-if="currentState === 'confirm'"
          size="xl"
          class="min-w-[100px] text-center justify-center"
          @click="submitData"
          label="Так"
      />
      <UButton
          v-if="currentState === 'success' || currentState === 'error'"
          color="info"
          variant="outline"
          size="xl"
          class="min-w-[100px] text-center justify-center"
          @click="close"
          label="Закрити"
      />
      <UButton
          v-if="currentState === 'error'"
          color="warning"
          variant="outline"
          size="xl"
          class="min-w-[100px] text-center justify-center"
          @click="submitData"
          label="Спробувати знову"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { RouteData } from '@/models/RouteModels'

interface Props {
  modelValue: boolean;
  title?: string;
  routeData: RouteData;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: 'Підтвердження редагування'
});

const emit = defineEmits<{
  (e: 'success', data: object): void;
  (e: 'error', data: object): void;
}>();

const isModalOpen = ref(props.modelValue);
const currentState = ref('confirm');
const errorMessage = ref('');

const close = () => {
  if (currentState.value === 'loading') {
    return;
  }
  currentState.value = 'confirm';
  isModalOpen.value = false;
};

const submitData = async () => {
  try {
    currentState.value = 'loading';

    // Імітація PUT-запиту для редагування маршруту
    console.log('Редагування маршруту (заглушка):', props.routeData);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResponse = {
      success: true,
      message: 'Маршрут оновлено успішно',
      id: props.routeData.id || 'existing-id'
    };

    currentState.value = 'success';
    emit('success', mockResponse);
  } catch (error: any) {
    console.error('Помилка редагування:', error);
    errorMessage.value = error.message || 'Невідома помилка';
    currentState.value = 'error';
    emit('error', error);
  }
};
</script>
