// composables/useApiFetch.ts
import { useUserStore } from '~/stores/useUserStore'
import { storeToRefs } from 'pinia'

export function useApiFetch<T>(url: string, options: any = {}) {
  const config = useRuntimeConfig()
  const userStore = useUserStore()
  const { accessToken } = storeToRefs(userStore)

  return $fetch<T>(url, {
    baseURL: config.public.apiBase,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
      ...(options.headers || {}),
    },
    ...options,

    onRequestError({ error }) {
      console.error('[Request Error]', error)
    },

    onResponseError({ response }) {
      const code = response._data?.code
      const message = response._data?.message
      if (code === 401 || message?.includes('Unauthenticated')) {
        return navigateTo('/')
      }
    },
  })
}
