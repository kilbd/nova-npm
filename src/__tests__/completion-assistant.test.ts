import { NpmCompletionAssistant } from '../completion-assistant'

// Mocking NpmDataService dependency here. Tests without a mock
// service are in integration tests.
const mockPackageData = jest.fn()
const mockVersionData = jest.fn()
jest.mock('../data-service', () => {
  return {
    __esModule: true,
    NpmDataService: jest.fn().mockImplementation(() => {
      return {
        getPackageNames: mockPackageData,
        getVersions: mockVersionData,
      }
    }),
  }
})
const mockDocument = jest.fn(() => '')
const editor: any = {
  document: { path: 'package.json', length: 80 },
  getTextInRange: mockDocument,
}

function context(
  text: string,
  line: string,
  position: number
): CompletionContext {
  return {
    text: text,
    line: line,
    position: position,
    reason: CompletionReason.Character,
  }
}

describe('NpmCompletionAssistant', () => {
  const assist = new NpmCompletionAssistant()

  beforeEach(() => {
    mockDocument.mockClear()
    mockPackageData.mockReset()
    mockVersionData.mockReset()
  })

  it('should not provide completions when not in dependency object', async () => {
    const result = await assist.provideCompletionItems(
      editor as TextEditor,
      context('j', 'j', 1)
    )
    expect(result).toEqual([])
    expect(mockPackageData.mock.calls.length).toBe(0)
  })

  it('should offer package name completions', async () => {
    const packages = [
      ['jest', '27.0.1'],
      ['jest-cli', '27.0.1'],
      ['je', '1.0.1'],
    ]
    const expected = [
      '"jest": "${0:^27.0.1}",',
      '"jest-cli": "${0:^27.0.1}",',
      '"je": "${0:^1.0.1}",',
    ]
    mockDocument.mockReturnValueOnce('{"name":"test","dependencies":{ je }}')
    mockPackageData.mockResolvedValue(packages)
    const result = (await assist.provideCompletionItems(
      editor as TextEditor,
      context('je', ' je', 34)
    )) as CompletionItem[]
    expect(result).toBeTruthy()
    for (let [index, item] of result.entries()) {
      expect(item.insertText).toBe(expected[index])
    }
  })

  it('should offer package version completions', async () => {
    mockDocument.mockReturnValueOnce(
      '{"name":"test","dependencies":{ "jest": "l",}}'
    )
    mockVersionData.mockResolvedValue({
      latest: '26.4.1',
      alpha: '27.0.0-alpha',
    })
    const result = (await assist.provideCompletionItems(
      editor as TextEditor,
      context('l', ' "jest": "l', 42)
    )) as CompletionItem[]
    expect(result).toBeTruthy()
    expect(result[0].label).toEqual('^26.4.1')
    expect(result[8].label).toEqual('~27.0.0-alpha')
    expect(result[8].filterText).toEqual('alpha')
  })

  it('should trigger properly in document with dependencies', () => {
    const doc = '{"name":"test","dependencies":{ }}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
  })

  it('should trigger properly in document with dev dependencies', () => {
    const doc = '{"name":"test","devDependencies":{ }}'
    let inDependencies = assist.inDependencies(doc, 34)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
  })

  it('should trigger in document with both run and dev dependencies', () => {
    const doc =
      '{"name":"test","dependencies":{ },"devDependencies":{"jest":"^24.0.6"}}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 56)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
    inDependencies = assist.inDependencies(doc, 50)
    expect(inDependencies).toBeFalsy()
  })

  it('should not trigger in document with no dependencies', () => {
    const doc = '{"name":"test","scripts":{"run":"node main.js"}}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeFalsy()
  })

  it('should append completions for major/minor compatibility versions', () => {
    const expected: CompletionItem[] = []
    const maj = new CompletionItem('^1.2.3', CompletionItemKind.Package)
    maj.detail = 'latest'
    maj.filterText = 'latest'
    const majNum = new CompletionItem('^1.2.3', CompletionItemKind.Package)
    majNum.detail = 'latest'
    const min = new CompletionItem('~1.2.3', CompletionItemKind.Package)
    min.detail = 'latest'
    min.filterText = 'latest'
    const minNum = new CompletionItem('~1.2.3', CompletionItemKind.Package)
    minNum.detail = 'latest'
    const exact = new CompletionItem('1.2.3', CompletionItemKind.Package)
    exact.detail = 'latest'
    exact.filterText = 'latest'
    const exactNum = new CompletionItem('1.2.3', CompletionItemKind.Package)
    exactNum.detail = 'latest'
    expected.push(maj)
    expected.push(majNum)
    expected.push(min)
    expected.push(minNum)
    expected.push(exact)
    expected.push(exactNum)
    let returned: CompletionItem[] = []
    assist.qualifiedVersions('1.2.3', 'latest', returned)
    expect(expected).toEqual(returned)
  })
})
