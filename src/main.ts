import { NpmCompletionAssistant } from './completion-assistant'

exports.activate = function () {
  // Do work when the extension is activated
}

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
}

nova.assistants.registerCompletionAssistant(
  'json',
  new NpmCompletionAssistant(),
  { triggerChars: new Charset(': "^~') }
)
