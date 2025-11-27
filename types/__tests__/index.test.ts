import { LotStatus } from '@/types'

describe('Types', () => {
  describe('LotStatus', () => {
    it('should have correct status values', () => {
      expect(LotStatus.AVAILABLE).toBe('available')
      expect(LotStatus.RESERVED).toBe('reserved')
      expect(LotStatus.SOLD).toBe('sold')
      expect(LotStatus.BLOCKED).toBe('blocked')
    })
  })
})
