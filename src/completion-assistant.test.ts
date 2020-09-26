import { NpmCompletionAssistant } from './completion-assistant'

describe('NpmCompletionAssistant', () => {
  it('works', () => {
    const assist = new NpmCompletionAssistant()
    const doc = '{"name":"test","dependencies":{ }}'
    const inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeTruthy()
  })
})
