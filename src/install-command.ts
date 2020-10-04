export class InstallCommand {
  constructor(private manager: string) {}

  run(workspace: Workspace): void {
    const roots = this.findPackageJsons(workspace.path)
    if (roots.length > 1) {
      workspace.showChoicePalette(
        roots,
        { placeholder: 'Which package.json?' },
        (selected) => {
          console.log(selected)
        }
      )
    }
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
