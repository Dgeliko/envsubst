import * as core from '@actions/core'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {readFile, writeFile} from 'node:fs/promises'
import {substitute} from './substitute'

const run = async (): Promise<void> => {
  try {
    const inFile = core.getInput('in-file', {required: true})
    const outFile = core.getInput('out-file', {required: true})
    const envFile = core.getInput('env-file')

    core.debug(`in file: ${inFile}`)
    core.debug(`out file: ${outFile}`)
    core.debug(`env file: ${envFile}`)

    if (envFile) {
      const result = dotenv.config({path: path.resolve(process.cwd(), envFile), quiet: true})
      if (result.error) throw result.error
    }

    const template = await readFile(inFile, 'utf8')
    const result = substitute(template)
    if (outFile === 'stdout') {
      await new Promise<void>((resolve, reject) => {
        process.stdout.write(result, (error) => error ? reject(error) : resolve())
      })
    } else {
      await writeFile(outFile, result, 'utf8')
    }

    core.setOutput('out-file-created', 'true')
  } catch (error) {
    core.setOutput('out-file-created', 'false')
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

// Don't auto-execute in the test environment
if (process.env['NODE_ENV'] !== 'test') {
  run()
}

export default run
