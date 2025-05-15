import { defineStore } from "pinia";
export const useUIStore = defineStore("ui", () => {
  const isMenuCollapsed = ref(false);
  const isSidebarCollapsed = ref(false);
  const isSignModalOpen = ref(false);
  const docs = ref([{id: 0, fileName: null}]);

  function $reset() {
    isMenuCollapsed.value = false;
    isSidebarCollapsed.value = false;
    isSignModalOpen.value = false;
    docs.value = [{id: 0, fileName: null}];
  }

  return {
    isMenuCollapsed,
    isSidebarCollapsed,
    isSignModalOpen,
    docs,
    $reset,
  };
}, {});
