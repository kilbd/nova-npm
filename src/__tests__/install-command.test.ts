import { InstallCommand } from '../install-command'

// Need to mock the FileSystem and Workspace objects
const mockFileTypeCheck = jest.fn()
const mockDirFiles = jest.fn()
const mockFileStats = jest.fn(() => {
  return { isDirectory: mockFileTypeCheck, isFile: mockFileTypeCheck }
})
const mockShowChoicePalette = jest.fn(
  (choices: string[], opt: any, callback: (picked: string) => void) => {
    callback(choices[0])
  }
)
const mockShowInputPalette = jest.fn()
const mockWorkspace: any = {
  path: '/Users/test',
  showChoicePalette: mockShowChoicePalette,
  showInputPalette: mockShowInputPalette,
}
const testGlobal = global as any
testGlobal.nova = {
  fs: {
    listdir: mockDirFiles,
    stat: mockFileStats,
  },
}

describe('InstallCommand', () => {
  let command = new InstallCommand('npm')

  beforeEach(() => {
    mockFileTypeCheck.mockReset()
    mockDirFiles.mockReset()
    mockFileStats.mockClear()
    mockShowChoicePalette.mockClear()
    mockShowInputPalette.mockClear()
    mockDirFiles
      .mockReturnValueOnce(['project_one', 'project_two', 'README.md'])
      .mockReturnValueOnce(['package.json', 'node_modules', 'index.js'])
      .mockReturnValueOnce(['index.js', 'package.json', 'src'])
      .mockReturnValueOnce([])
    mockFileTypeCheck
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
  })

  it('should show a root folder picker before package input', () => {
    command.run(mockWorkspace as Workspace)
    expect(mockShowChoicePalette.mock.calls.length).toBe(1)
  })

  it('should skip showing a choice picker before package input', () => {
    mockDirFiles.mockReset()
    mockFileTypeCheck.mockReset()
    mockDirFiles.mockReturnValueOnce(['package.json', 'index.js'])
    mockFileTypeCheck
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
    command.run(mockWorkspace as Workspace)
    expect(mockShowChoicePalette.mock.calls.length).toBe(0)
  })

  it('should find a package.json in top directory', () => {
    const expected = ['.']
    mockDirFiles.mockReset()
    mockFileTypeCheck.mockReset()
    mockDirFiles
      .mockReturnValueOnce(['package.json', 'src'])
      .mockReturnValueOnce([])
    mockFileTypeCheck
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    const results = command.findPackageJsons('.')
    expect(results.length).toBe(1)
    expect(results).toEqual(expected)
  })

  it('should find two directories with package.json files', () => {
    const expected = ['./project_one', './project_two']
    const results = command.findPackageJsons('.')
    expect(results.length).toBe(2)
    expect(results).toEqual(expected)
  })
})
