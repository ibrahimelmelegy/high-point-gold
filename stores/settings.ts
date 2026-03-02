import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const lang = ref('ar')
  const theme = ref('dark')
  const isAlertEnabled = ref(false)
  const activeSection = ref('dashboard')

  function setLang(newLang: string) {
    lang.value = newLang
  }

  function setSection(section: string) {
    activeSection.value = section
  }

  function toggleAlert() {
    isAlertEnabled.value = !isAlertEnabled.value
  }

  return {
    lang,
    theme,
    isAlertEnabled,
    activeSection,
    setLang,
    setSection,
    toggleAlert
  }
})
