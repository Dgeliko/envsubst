import * as core from '@actions/core'
import * as fs from 'fs'
import run from '../fast-envsubst'

const originalEnv = {...process.env}

afterEach(() => {
  jest.restoreAllMocks()
  process.env = {...originalEnv}
})

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
      name === 'env-file' ? '__tests__/fixtures/missing.env' :
        name === 'in-file' ? fixtures.inFile : runner.outFile,
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


describe('input validation and I/O', () => {
  it.each(['in-file', 'out-file'])('rejects missing %s', async (missing) => {
    jest.mocked(core.getInput).mockRestore()
    process.env['INPUT_IN-FILE'] = fixtures.inFile
    process.env['INPUT_OUT-FILE'] = runner.outFile
    delete process.env[`INPUT_${missing.toUpperCase()}`]
    const failed = jest.spyOn(core, 'setFailed').mockImplementation(() => {})
    const output = jest.spyOn(core, 'setOutput').mockImplementation(() => {})
    await run()
    expect(failed).toHaveBeenCalledWith(`Input required and not supplied: ${missing}`)
    expect(output).toHaveBeenCalledWith('out-file-created', 'false')
  })

  it('works without an env file and reports success', async () => {
    process.env.ROGER = 'RABBIT'
    jest.mocked(core.getInput).mockImplementation((name) =>
      name === 'in-file' ? fixtures.inFile : name === 'out-file' ? runner.outFile : '',
    )
    const output = jest.spyOn(core, 'setOutput').mockImplementation(() => {})
    await run()
    expect(fs.readFileSync(runner.outFile, 'utf8')).toBe(fs.readFileSync(fixtures.outFile, 'utf8'))
    expect(output).toHaveBeenCalledWith('out-file-created', 'true')
  })

  it('keeps existing environment values ahead of the env file', async () => {
    process.env.ROGER = 'existing'
    await run()
    expect(fs.readFileSync(runner.outFile, 'utf8')).toContain('roger: existing')
  })

  it.each(['in-file', 'out-file'])('reports a missing path for %s', async (missing) => {
    jest.mocked(core.getInput).mockImplementation((name) =>
      name === missing ? '__tests__/missing-directory/file' :
        name === 'in-file' ? fixtures.inFile : name === 'out-file' ? runner.outFile : '',
    )
    const failed = jest.spyOn(core, 'setFailed').mockImplementation(() => {})
    const output = jest.spyOn(core, 'setOutput').mockImplementation(() => {})
    await run()
    expect(failed).toHaveBeenCalledWith(expect.stringContaining('ENOENT'))
    expect(output).toHaveBeenCalledWith('out-file-created', 'false')
  })
})
