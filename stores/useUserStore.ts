import { defineStore } from "pinia";
export const useUserStore = defineStore("user", () => {
    const user = ref();
    const accessToken = ref();

    function $reset() {
        user.value = null;
        accessToken.value = null;
    }

    return {
        user,
        accessToken,
        $reset,
    };
}, {
    persist: true
});
