import { defineStore } from 'pinia'

interface settingItem {
    id:string
    name: string
    apiUrl: string
    apiKey: string
    model: string
  }
interface ApiSettingState {
  settingList: settingItem[]
  modelForm: {
    mainChatModel: string
    summaryModel: string
    dynamicModel: string
    applyToAll: boolean
  }
}
const useApiSettingStore = defineStore('apiSetting', () => {

  const settingList = ref<ApiSettingState["settingList"]>([])
  const modelForm = ref<ApiSettingState["modelForm"]>({
    mainChatModel:'',
    summaryModel:'',
    dynamicModel:'',
    applyToAll: false,
  })
  function addApiSetting(data:settingItem){
    settingList.value.push(data)
  }
  function updateApiSetting(data:settingItem){
    const index = settingList.value.findIndex(item=>item.id===data.id)
    if(index!==-1){
      settingList.value[index] = data
    }else{
      addApiSetting(data)
    }
  }
  function deleteApiSetting(id:string){
    settingList.value = settingList.value.filter(item => item.id !== id)
  }
  return {
    settingList,
    modelForm,
    addApiSetting,
    updateApiSetting,
    deleteApiSetting
  }
}, {

  persist: true,
})

export default useApiSettingStore
