<template>
  <NuxtLayout name="error">
    <NuxtLoadingIndicator />

    <section class="container mx-auto lg:px-4 lg:px-14 text-center flex flex-col items-center my-8">
      <div v-if="error.statusCode == 404">
        <h1 class="text-center font-bold text-xl my-4">404</h1>
        <h1 class="text-center text-xl my-4">Page Not Found</h1>
      </div>

      <div v-else>
        <h1 class="text-center my-2 text-xl">An error occurred - {{ error.statusCode }}</h1>
        <p class="text-center my-2 text-lg">{{ error.statusMessage }}</p>
      </div>

      <a href="/" class="mt-4 w-1/4">Home page</a>
    </section>

  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>


