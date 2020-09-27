// Need to mock global classes of Nova Extension API

enum MockCompletionItemKind {
  Package,
}

class MockCompletionItem {
  detail: string | undefined
  filterText: string | undefined
  insertText: string | undefined
  constructor(public label: string, public kind: CompletionItemKind) {}
}

const testGlobal = global as any
testGlobal.CompletionItem = MockCompletionItem
testGlobal.CompletionItemKind = MockCompletionItemKind
