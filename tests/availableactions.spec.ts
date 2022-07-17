import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import config from 'vue'
import AvailableActions from '@/components/bsx/Gallery/Item/AvailableActions.vue'

describe('Test', (): void => {
  let getters
  let store

  beforeEach(() => {})

  it('is a test', () => {
    // Create VueI18n instance with options
    const localVue = createLocalVue()
    localVue.use(Vuex)

    getters = {}

    store = new Vuex.Store({
      getters,
    })

    //(AvailableActions).toBeTruthy();
    const wrapper = mount(AvailableActions, {
      store,
      localVue,
      mocks: {
        $t: () => {},
        $config: {
          prefix: '',
        },
      },
    })

    expect(wrapper).toBe(1)
  })
})
