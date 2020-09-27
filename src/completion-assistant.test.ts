import { NpmCompletionAssistant } from './completion-assistant'

describe('NpmCompletionAssistant', () => {
  const assist = new NpmCompletionAssistant()

  it('should trigger properly in document with dependencies', () => {
    const doc = '{"name":"test","dependencies":{ }}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
  })

  it('should trigger properly in document with dev dependencies', () => {
    const doc = '{"name":"test","devDependencies":{ }}'
    let inDependencies = assist.inDependencies(doc, 34)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
  })

  it('should trigger in document with both run and dev dependencies', () => {
    const doc =
      '{"name":"test","dependencies":{ },"devDependencies":{"jest":"^24.0.6"}}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 56)
    expect(inDependencies).toBeTruthy()
    inDependencies = assist.inDependencies(doc, 12)
    expect(inDependencies).toBeFalsy()
    inDependencies = assist.inDependencies(doc, 50)
    expect(inDependencies).toBeFalsy()
  })

  it('should not trigger in document with no dependencies', () => {
    const doc = '{"name":"test","scripts":{"run":"node main.js"}}'
    let inDependencies = assist.inDependencies(doc, 31)
    expect(inDependencies).toBeFalsy()
  })
})
