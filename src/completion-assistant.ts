import { NpmDataService } from './data-service'

export class NpmCompletionAssistant implements CompletionAssistant {
  dataSvc: NpmDataService
  packageTest = /^(\s*)"?([@a-z0-9\/_-]+)/
  versionTest = /^(\s*)"([@a-z0-9\/_-]+)": *"?([~^]?)([a-z\.0-9_-]+)/
  // packageFormatTest = /^(\s*)"([@a-z0-9/_-]+)/
  // versionFormatTest = /^(\s*)"([@a-z0-9/_-]+)": "([^~]?(\d+\.?){0,3})/

  constructor() {
    this.dataSvc = new NpmDataService()
  }

  async provideCompletionItems(
    editor: TextEditor,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    if (editor?.document?.path?.indexOf('package.json') !== -1) {
      let doc = editor.getTextInRange(new Range(0, editor.document.length))
      if (this.inDependencies(doc, context.position)) {
        if (this.versionTest.test(context.line)) {
          let options: CompletionItem[] = []
          const matches = context.line.match(this.versionTest)
          const versions = await this.dataSvc.getVersions(matches?.[2])
          this.qualifiedVersions(versions.latest, 'latest', options)
          Object.keys(versions).forEach((key) => {
            if (key !== 'latest') {
              this.qualifiedVersions(versions[key], key, options)
            }
          })
          return options
        } else if (this.packageTest.test(context.line)) {
          const pkgMatch = context.line.match(this.packageTest)
          const packages: [
            string,
            string
          ][] = await this.dataSvc.getPackageNames(pkgMatch?.[2])
          return packages.map((pkg, idx) => {
            let item = new CompletionItem(
              `${idx + 1} ${pkg[0]}`,
              CompletionItemKind.Package
            )
            item.insertText = `"${pkg[0]}": "\${0:^${pkg[1]}}",`
            item.insertTextFormat = InsertTextFormat.Snippet
            return item
          })
        }
      }
    }
    return []
  }

  inDependencies(doc: string, position: number): boolean {
    let depStart = doc.indexOf('"dependencies"')
    depStart = depStart !== -1 ? doc.indexOf('{', depStart) : 0
    const depEnd = depStart ? doc.indexOf('}', depStart) : 0
    let devDepStart = doc.indexOf('"devDependencies"')
    devDepStart = devDepStart !== -1 ? doc.indexOf('{', devDepStart) : 0
    const devDepEnd = devDepStart ? doc.indexOf('}', devDepStart) : 0
    // Only want to trigger suggestions if the cursor is within the `dependencies`
    // or `devDependencies` objects.
    return (
      (position > depStart && position < depEnd) ||
      (position > devDepStart && position < devDepEnd)
    )
  }

  qualifiedVersions(
    version: string,
    label: string,
    list: CompletionItem[]
  ): void {
    const prefixes = ['^', '~', '']
    prefixes.forEach((prefix) => {
      const completionText = `${prefix}${version}`
      const byLabel = this.generateCompletion(completionText, label)
      byLabel.filterText = label
      const byText = this.generateCompletion(completionText, label)
      list.push(byLabel)
      list.push(byText)
    })
  }

  generateCompletion(text: string, label: string): CompletionItem {
    const completion = new CompletionItem(text, CompletionItemKind.Package)
    completion.detail = label
    return completion
  }
}
