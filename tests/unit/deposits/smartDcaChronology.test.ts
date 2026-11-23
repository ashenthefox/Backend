import {
  computeVolatilityRegime,
  computeContribution,
  type SmartDcaConfig,
} from '../../../src/deposits/smartDcaPolicy'

describe('chronological latest observation in adaptive DCA (#750)', () => {
  const history = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  it('classifies the last chronological value below p25 as HIGH', () => {
    expect(
      computeVolatilityRegime({ recentValues: [...history.slice(1), 10] })
    ).toBe('HIGH')
  })

  it('classifies the last chronological value between p25 and p75 as NORMAL', () => {
    expect(
      computeVolatilityRegime({
        recentValues: [10, 20, 30, 40, 50, 60, 70, 80, 90, 50],
      })
    ).toBe('NORMAL')
  })

  it('classifies the last chronological value at or above p75 as LOW', () => {
    expect(computeVolatilityRegime({ recentValues: history })).toBe('LOW')
  })

  it('uses the chronological last value with explicitly provided percentiles', () => {
    expect(
      computeVolatilityRegime({
        recentValues: [100, 50, 10],
        historicalP25: 25,
        historicalP75: 75,
      })
    ).toBe('HIGH')
  })

  it('scales a cheap latest observation upward for ADAPTIVE plans', () => {
    const plan: SmartDcaConfig = {
      policy: 'ADAPTIVE',
      catchUpMode: 'RETRY',
      pauseOnDrawdownPct: null,
      doubleOnDrawdown: false,
      accumulatedRuns: 0,
      consecutiveFailures: 0,
      allocationMap: null,
    }
    const result = computeContribution(
      plan,
      100,
      { recentValues: [20, 30, 40, 50, 60, 70, 80, 90, 100, 10] },
      null
    )
    expect(result.regime).toBe('HIGH')
    expect(result.appliedAmount).toBe(125)
  })
})
