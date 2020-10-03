import { InstallCommand } from '../install-command'

const mockFileTypeCheck = jest.fn()
const mockDirFiles = jest.fn()
const mockFileStats = jest.fn(() => {
  return { isDirectory: mockFileTypeCheck, isFile: mockFileTypeCheck }
})
const testGlobal = global as any
testGlobal.nova = {
  fs: {
    listdir: mockDirFiles,
    stat: mockFileStats,
  },
}

describe('InstallCommand', () => {
  const command = new InstallCommand()

  beforeEach(() => {
    mockFileTypeCheck.mockReset()
    mockDirFiles.mockReset()
    mockFileStats.mockClear()
  })

  it('should find a package.json in top directory', () => {
    const expected = ['.']
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
    const results = command.findPackageJsons('.')
    expect(results.length).toBe(2)
    expect(results).toEqual(expected)
  })
})
