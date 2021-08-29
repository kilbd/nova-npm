import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()
import { NpmDataService } from '../data-service'

const service = new NpmDataService()

describe('NpmDataService', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('should return package names sorted by popularity', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          package: {
            name: 'jes',
            version: '1.0.1',
          },
          score: {
            detail: {
              popularity: 0.059,
            },
          },
        },
        {
          package: {
            name: 'jest',
            version: '27.0.1',
          },
          score: {
            detail: {
              popularity: 0.8616,
            },
          },
        },
        {
          package: {
            name: 'jest-cli',
            version: '27.0.1',
          },
          score: {
            detail: {
              popularity: 0.7557,
            },
          },
        },
      ])
    )
    const expected = [
      ['jest', '27.0.1'],
      ['jest-cli', '27.0.1'],
      ['jes', '1.0.1'],
    ]
    expect.assertions(3)
    const result = await service.getPackageNames('jes')
    expect(fetchMock.mock.calls.length).toBe(1)
    expect(fetchMock.mock.calls[0][0]).toEqual(
      'https://api.npms.io/v2/search/suggestions?q=jes'
    )
    expect(result).toEqual(expected)
  })

  it('should return object with all versions', async () => {
    const expected = {
      latest: '26.4.2',
      beta: '24.2.0-alpha.0',
      next: '26.0.1-alpha.0',
    }
    fetchMock.mockResponseOnce(JSON.stringify(expected))
    expect.assertions(3)
    const result = await service.getVersions('jest')
    expect(fetchMock.mock.calls.length).toBe(1)
    expect(fetchMock.mock.calls[0][0]).toEqual(
      'https://registry.npmjs.org/-/package/jest/dist-tags'
    )
    expect(result).toEqual(expected)
  })
})
