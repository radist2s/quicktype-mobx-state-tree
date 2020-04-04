import {join as pathJoin} from 'path'
import {quicktype as quicktypeLib, quicktypeMultiFile} from 'quicktype/dist/quicktype-core'
import {CLIOptions, parseCLIOptions, makeQuicktypeOptions, writeOutput} from 'quicktype'
import {MobXStateTreeTargetLanguage} from './MobXStateTreeLanguage'
import {Options} from 'quicktype/dist/quicktype-core/Run'

export async function quicktype(options: Partial<Options>) {
    const optionsMerged = Object.assign({}, options, {
        lang: new MobXStateTreeTargetLanguage()
    })

    const {lines: schema} = await quicktypeLib(optionsMerged)

    return schema.join('\n')
}

export async function main(args: string[] | Partial<CLIOptions>) {
    const targetLanguage = new MobXStateTreeTargetLanguage()

    let cliOptions: CLIOptions
    if (Array.isArray(args)) {
        cliOptions = parseCLIOptions(args, targetLanguage)
    } else {
        throw new Error('Input arguments should be and array of cli options')
    }

    if (cliOptions.telemetry !== undefined) {
        switch (cliOptions.telemetry) {
            case 'enable':
                break
            case 'disable':
                break
            default:
                console.error("telemetry must be 'enable' or 'disable'")
                return
        }
        if (Array.isArray(args) && args.length === 2) {
            // This was merely a CLI run to set telemetry and we should not proceed
            return
        }
    }

    const quicktypeOptions = await makeQuicktypeOptions(cliOptions, [targetLanguage])

    if (quicktypeOptions === undefined) {
        return
    }

    const resultsByFilename = await quicktypeMultiFile(quicktypeOptions)

    writeOutput(cliOptions, resultsByFilename)
}

if (require.main === module) {
    main(process.argv.slice(2)).catch(e => {
        if (e instanceof Error) {
            console.error(`Error: ${e.message}.`)
        } else {
            console.error(e)
        }
        process.exit(1)
    })
}
