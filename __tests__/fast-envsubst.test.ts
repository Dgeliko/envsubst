import * as core from '@actions/core'
import * as fs from 'fs'
import run from '../fast-envsubst'

const fixtures = {
  inFile: '__tests__/fixtures/example.yaml.in',
  outFile: '__tests__/fixtures/example.yaml',
  envFile: '__tests__/fixtures/example.env',
}

const runner = {
  outFile: '__tests__/runner/example.yaml',
}

beforeEach(() => {
  jest.resetModules()
  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    switch (name) {
      case 'in-file':
        return fixtures.inFile
      case 'out-file':
        return runner.outFile
      case 'env-file':
        return fixtures.envFile
      default:
        return ''
    }
  })

  process.env['FOO_VALUE'] = 'cat good'
  process.env['BAR_VALUE'] = 'dog food'
})

describe('fast-envsubst action', () => {
  it('runs', async () => {
    await expect(run()).resolves.not.toThrow()
  })

  it('generates an outfile with substitutions done', async () => {
    await run()

    const outFileFixture = fs.readFileSync(fixtures.outFile)
    const outFileResult = fs.readFileSync(runner.outFile)

    expect(outFileFixture.toString()).toEqual(outFileResult.toString())
  })
})

describe('failure reporting', () => {
  it('reports a missing env file without generating output', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) =>
      name === 'env-file' ? '__tests__/fixtures/missing.env' : '',
    )
    const failed = jest.spyOn(core, 'setFailed').mockImplementation(() => {})
    const output = jest.spyOn(core, 'setOutput').mockImplementation(() => {})
    await run()
    expect(failed).toHaveBeenCalledWith(expect.stringContaining('ENOENT'))
    expect(output).toHaveBeenCalledWith('out-file-created', 'false')
    failed.mockRestore()
    output.mockRestore()
  })
})
