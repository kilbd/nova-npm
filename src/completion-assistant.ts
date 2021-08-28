import { NpmDataService } from './data-service'

export class NpmCompletionAssistant implements CompletionAssistant {
  dataSvc: NpmDataService
  packageTest = /^(\s*)"?([@a-z0-9\/_-]+)/
  versionTest = /^(\s*)"([@a-z0-9\/_-]+)":( *"?[~^]?)([a-z\.0-9_-]+)/
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
        console.log(context.text, context.line)
        if (this.versionTest.test(context.line)) {
          const replaceRange = this.getVersionRange(context, doc)
          let options: CompletionItem[] = []
          const matches = context.line.match(this.versionTest)
          const versions = await this.dataSvc.getVersions(matches?.[2])
          this.qualifiedVersions(
            versions.latest,
            'latest',
            options,
            replaceRange
          )
          Object.keys(versions).forEach((key) => {
            if (key !== 'latest') {
              this.qualifiedVersions(versions[key], key, options, replaceRange)
            }
          })
          console.log(`Provided ${options.length} options`)
          return options
        } else if (this.packageTest.test(context.line)) {
          const pkgMatch = context.line.match(this.packageTest)
          const packages: string[] = await this.dataSvc.getPackageNames(
            pkgMatch?.[2]
          )
          return packages.map((pkg, idx) => {
            let item = new CompletionItem(
              `${idx + 1} ${pkg}`,
              CompletionItemKind.Package
            )
            item.insertText = `"${pkg}": `
            const indentChars = pkgMatch?.[1]?.length || 0
            item.range = new Range(
              context.position - context.line.length + indentChars,
              context.position
            )
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
    list: CompletionItem[],
    range?: Range
  ): void {
    const prefixes = ['^', '~', '']
    prefixes.forEach((prefix) => {
      const completion = new CompletionItem(
        `${prefix}${version}`,
        CompletionItemKind.Package
      )
      completion.detail = label
      completion.filterText = label
      completion.insertText = ` "${prefix}${version}",`
      if (range) completion.range = range
      list.push(completion)
    })
  }

  getVersionRange(context: CompletionContext, document: string): Range {
    const matches = context.line.match(this.versionTest)
    const vLength: number = matches ? matches[3].length + matches[4].length : 0
    // Want to see if a quote mark or comma follows the cursor
    const afterCursor = document.substr(context.position, 10)
    const matchEnd = afterCursor.match(/^("?,?)/)
    const postLength = matchEnd?.[1]?.length || 0
    return new Range(context.position - vLength, context.position + postLength)
  }
}
