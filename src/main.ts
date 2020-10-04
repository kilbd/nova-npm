import { NpmCompletionAssistant } from './completion-assistant'
import { InstallCommand } from './install-command'

exports.activate = function () {
  // Do work when the extension is activated
}

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
}

nova.assistants.registerCompletionAssistant(
  'json',
  new NpmCompletionAssistant()
)

nova.commands.register('npmInstall', (workspace: Workspace) => {
  const command = new InstallCommand('npm')
  command.run(workspace)
})
