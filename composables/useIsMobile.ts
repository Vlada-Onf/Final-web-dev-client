//import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useWindowSize } from '@vueuse/core';

export default function () {
  const { width } = useWindowSize();

  const isServerRender = ref(true);
  //Tailwind breakpoints, doesn't work with resize window
  //const breakpoints = useBreakpoints(breakpointsTailwind);

  const isMobile = computed(() => {
    if(isServerRender.value) {
      return false
    }

    //return breakpoints.isSmaller('lg');
    return width.value < 1024;
  });

  onMounted(() => {
    isServerRender.value = false;
  });
  return isMobile;
}
