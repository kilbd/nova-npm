import { NpmDataService } from './data-service'

export class NpmCompletionAssistant implements CompletionAssistant {
  dataSvc: NpmDataService
  packageTest = /^(\s*)"?([@a-z0-9/_-]+)/
  versionTest = /^(\s*)"([@a-z0-9/_-]+)": *"?[~^]?([a-z\.0-9_-]+)/
  packageFormatTest = /^(\s*)"([@a-z0-9/_-]+)/
  versionFormatTest = /^(\s*)"([@a-z0-9/_-]+)": "([^~]?(\d+\.?){0,3})/

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
        if (this.versionTest.test(context.line)) {
          await this.formatBeforeVersion(context, editor)
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
          await this.formatBeforePackage(context, editor)
          const packages: string[] = await this.dataSvc.getPackageNames(
            context.line.match(this.packageTest)?.[2]
          )
          return packages.map((pkg, idx) => {
            let item = new CompletionItem(
              `${idx + 1} ${pkg}`,
              CompletionItemKind.Package
            )
            item.insertText = `${pkg}":`
            // item.tokenize = true;
            return item
          })
        }
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

  qualifiedVersions(
    version: string,
    label: string,
    list: CompletionItem[]
  ): void {
    const majVersion = new CompletionItem(
      `^${version}`,
      CompletionItemKind.Package
    )
    majVersion.detail = label
    majVersion.filterText = label
    majVersion.insertText = `^${version}",`
    const minorVersion = new CompletionItem(
      `~${version}`,
      CompletionItemKind.Package
    )
    minorVersion.detail = label
    minorVersion.filterText = label
    minorVersion.insertText = `~${version}",`
    const exactVersion = new CompletionItem(
      ` ${version}`,
      CompletionItemKind.Package
    )
    exactVersion.insertText = `${version}",`
    exactVersion.detail = label
    exactVersion.filterText = label
    list.push(majVersion)
    list.push(minorVersion)
    list.push(exactVersion)
  }

  async formatBeforePackage(
    context: CompletionContext,
    editor: TextEditor
  ): Promise<void> {
    const line: string = context.line
    if (!this.packageFormatTest.test(line)) {
      const range = new Range(context.position - line.length, context.position)
      const matches = line.match(this.packageTest)
      await editor.edit((edit: TextEditorEdit) => {
        const replacement = `${matches?.[1]}"${matches?.[2]}`
        edit.replace(range, replacement.substr(0, line.length))
        edit.insert(context.position, replacement.substring(line.length))
      })
    }
  }

  async formatBeforeVersion(
    context: CompletionContext,
    editor: TextEditor
  ): Promise<void> {
    const line = context.line
    if (!this.versionFormatTest.test(line)) {
      const range = new Range(context.position - line.length, context.position)
      const matches = line.match(this.versionTest)
      await editor.edit((edit: TextEditorEdit) => {
        const replacement = `${matches?.[1]}"${matches?.[2]}": "${matches?.[3]}`
        edit.replace(range, replacement.substr(0, line.length))
        edit.insert(context.position, replacement.substring(line.length))
      })
    }
  }
}
