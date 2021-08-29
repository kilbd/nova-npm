// Need to mock global classes of Nova Extension API

enum MockCompletionItemKind {
  Package,
}

enum MockCompletionReason {
  Character,
  Invoke,
}

enum MockInsertTextFormat {
  PlainText,
  Snippet,
}

class MockRange {
  constructor(readonly start: number, readonly end: number) {}
}

class MockCompletionItem {
  detail?: string
  filterText?: string
  insertText?: string
  range?: MockRange
  constructor(public label: string, public kind: MockCompletionItemKind) {}
}

const testGlobal = global as any
testGlobal.CompletionItem = MockCompletionItem
testGlobal.CompletionItemKind = MockCompletionItemKind
testGlobal.CompletionReason = MockCompletionReason
testGlobal.InsertTextFormat = MockInsertTextFormat
testGlobal.Range = MockRange
