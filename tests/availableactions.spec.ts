import { shallowMount } from '@vue/test-utils'
import AvailableActions from '@/components/bsx/Gallery/Item/AvailableActions.vue'

describe('Test', (): void => {
  it('is a test', () => {
    //(AvailableActions).toBeTruthy();
    const wrapper = shallowMount(AvailableActions)

    expect(wrapper.getBalance()).toBe(1)
  })
})
