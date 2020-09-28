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
    expect(result).toBeUndefined()
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
    maj.insertText = ' "^1.2.3",'
    maj.detail = 'latest'
    maj.filterText = 'latest'
    const min = new CompletionItem('~1.2.3', CompletionItemKind.Package)
    min.insertText = ' "~1.2.3",'
    min.detail = 'latest'
    min.filterText = 'latest'
    const exact = new CompletionItem(' 1.2.3', CompletionItemKind.Package)
    exact.insertText = ' "1.2.3",'
    exact.detail = 'latest'
    exact.filterText = 'latest'
    expected.push(maj)
    expected.push(min)
    expected.push(exact)
    let returned: CompletionItem[] = []
    assist.qualifiedVersions('1.2.3', 'latest', returned)
    expect(expected).toEqual(returned)
    const range = new Range(10, 20)
    maj.range = range
    min.range = range
    exact.range = range
    returned = []
    assist.qualifiedVersions('1.2.3', 'latest', returned, range)
    expect(expected).toEqual(returned)
  })

  it('should set version replacement range to context.text + leading space', () => {
    const doc = '{"dependencies": {    "jest": l}}'
    const result = assist.getVersionRange(
      context('l', '    "jest": l', 31),
      doc
    )
    expect(result.start).toBe(29)
    expect(result.end).toBe(31)
  })

  it('should set version replacement range to context.text + quotes', () => {
    const contextObj = context('l', '    "jest": "l', 32)
    let doc = '{"dependencies": {    "jest": "l"}}'
    let result = assist.getVersionRange(contextObj, doc)
    expect(result.start).toBe(29)
    expect(result.end).toBe(33)
    // Now try with trailing comma
    doc = '{"dependencies": {    "jest": "l",}}'
    result = assist.getVersionRange(contextObj, doc)
    expect(result.start).toBe(29)
    expect(result.end).toBe(34)
  })
})
