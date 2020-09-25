export class NpmDataService {
  constructor() {}

  async getPackageNames(query: string): Promise<string[]> {
    let result = await fetch(
      `https://api.npms.io/v2/search/suggestions?q=${query}`
    )
    let data: NpmsIoData[] = await result.json()
    data.sort((a, b) => b.score.detail.popularity - a.score.detail.popularity)
    return data.map((item) => item.package.name)
  }

  async getVersions(packageName: string = ''): Promise<NpmVersions> {
    let result = await fetch(
      `https://registry.npmjs.org/-/package/${packageName}/dist-tags`
    )
    return await result.json()
  }
}

export interface NpmVersions {
  latest: string
  [key: string]: string
}

interface NpmsIoData {
  package: {
    name: string
  }
  score: {
    detail: {
      popularity: number
    }
  }
}
