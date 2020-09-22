import { NpmDataService } from './data-service'

export class NpmCompletionAssistant implements CompletionAssistant {
  dataSvc: NpmDataService

  constructor() {
    this.dataSvc = new NpmDataService()
  }

  async provideCompletionItems(
    editor: TextEditor,
    context: CompletionContext
  ): Promise<CompletionItem[] | void> {
    if (editor?.document?.path?.indexOf('package.json') !== -1) {
      let doc = editor.getTextInRange(new Range(0, editor.document.length))
      if (this.inDependencies(doc, context)) {
        const packages: string[] = await this.dataSvc.getPackageNames(
          context.text
        )
        return packages.map((pkg, idx) => {
          let item = new CompletionItem(
            `${idx} ${pkg}`,
            CompletionItemKind.Package
          )
          item.insertText = `"${pkg}": `
          // item.tokenize = true;
          return item
        })
      }
    }
  }

  inDependencies(doc: string, context: CompletionContext): boolean {
    let depStart = doc.indexOf('"dependencies"')
    depStart = depStart !== -1 ? doc.indexOf('{', depStart) : 0
    const depEnd = depStart ? doc.indexOf('}', depStart) : 0
    let devDepStart = doc.indexOf('"devDependencies"')
    devDepStart = devDepStart !== -1 ? doc.indexOf('{', devDepStart) : 0
    const devDepEnd = devDepStart ? doc.indexOf('}', devDepStart) : 0
    // Only want to trigger suggestions if the cursor is within the `dependencies`
    // or `devDependencies` objects.
    return (
      (context.position > depStart && context.position < depEnd) ||
      (context.position > devDepStart && context.position < devDepEnd)
    )
  }
}
