<template>
  <div class="flex min-h-screen">
    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white border-b flex items-center px-6 text-xl font-semibold shadow-sm">
        Панель керування
      </header>

      <!-- Page content -->
      <main class="p-6 bg-gray-50 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
