export class InstallCommand {
  nodeRoot?: string

  constructor(private manager: string) {}

  run(workspace: Workspace): void {
    const roots = this.findPackageJsons(workspace.path)
    if (roots.length > 1) {
      workspace.showChoicePalette(
        roots,
        { placeholder: 'Which package.json?' },
        (selected) => {
          if (selected) {
            this.nodeRoot = selected
            this.showPackageInput(workspace)
          }
        }
      )
    } else if (roots.length === 1) {
      this.nodeRoot = roots[0]
      this.showPackageInput(workspace)
    } else {
      //TODO: notify user of error
    }
  }

  showPackageInput(workspace: Workspace): void {
    workspace.showInputPalette(
      'Enter a package name (followed by `-d` if this is a dev dependency).\nLEAVE EMPTY to install all dependencies in package.json.',
      { placeholder: '<package> [-d]' },
      (input: string | null) => {
        //TODO: call install process
        console.log(input)
      }
    )
  }

  findPackageJsons(dir: string | null): string[] {
    const results: string[] = []
    if (dir) this.inspectDir(dir, results)
    return results
  }

  inspectDir(dir: string, hits: string[]): void {
    const items = nova.fs.listdir(dir)
    items.forEach((item) => {
      const itemPath = `${dir}/${item}`
      const stats = nova.fs.stat(itemPath)
      if (stats?.isFile() && item === 'package.json') {
        hits.push(dir)
      } else if (stats?.isDirectory() && item !== 'node_modules') {
        this.inspectDir(itemPath, hits)
      }
    })
  }
}
