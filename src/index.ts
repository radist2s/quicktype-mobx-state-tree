#!/usr/bin/env node

import {relative as pathRelative, resolve as pathResolve, dirname as pathDirname, extname as pathExtname, join as pathJoin} from 'path'
import {statSync, lstatSync} from 'fs'
import {quicktype as quicktypeLib, quicktypeMultiFile} from 'quicktype/dist/quicktype-core'
import {CLIOptions, parseCLIOptions, makeQuicktypeOptions, writeOutput} from 'quicktype'
import {MobXStateTreeTargetLanguage, mstOptions} from './MobXStateTreeLanguage'
import {Options} from 'quicktype/dist/quicktype-core/Run'
import captureStdOut from './stdout-capture'

export async function quicktype(options: Partial<Options>) {
    const optionsMerged = Object.assign({}, options, {
        lang: new MobXStateTreeTargetLanguage()
    })

    const {lines: schema} = await quicktypeLib(optionsMerged)

    return schema.join('\n')
}

export function resolveTypesModuleOption(options: Partial<Options>, outPath?: string) {
    if (!options || !options.rendererOptions || !outPath || options.outputFilename === 'stdout') {
        return options
    }

    const {rendererOptions} = options

    const typesModule = mstOptions.typesModule.getValue(rendererOptions)

    if (!typesModule) {
        return options
    }

    const moduleAbsPath = pathResolve(typesModule)

    const moduleFileExtname = pathExtname(moduleAbsPath)

    const isFilePathModule = Array.prototype.some.call([moduleAbsPath], function (path) {
        try {
            const moduleLstat = statSync(path)

            return moduleLstat.isFile() || moduleLstat.isDirectory()
        } catch (e) {
            return false
        }
    })

    if (!isFilePathModule) {
        return options
    }

    const outDir: string = (() => {
        const outPathAbs = pathResolve(outPath)

        try {
            if (lstatSync(outPathAbs).isDirectory()) {
                return outPathAbs
            }
        } catch (e) {}

        return pathDirname(outPathAbs)
    })()

    const moduleImportPath: string = (() => {
        const moduleOutputPath = pathRelative(outDir, moduleAbsPath)

        return moduleFileExtname ? moduleOutputPath.slice(0, -moduleFileExtname.length) : moduleOutputPath
    })()

    return {
        ...options,
        rendererOptions: {
            ...rendererOptions,
            [mstOptions.typesModule.definition.name]:
                moduleImportPath[0] === '.' ? moduleImportPath : `./${moduleImportPath}`
        }
    }
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

    const [quicktypeOptions, stdOut] = await captureStdOut(async function () {
        const typedOptions = await makeQuicktypeOptions(cliOptions, [targetLanguage])
        if (!typedOptions) {
            return undefined
        }

        return resolveTypesModuleOption(typedOptions, cliOptions.out)
    })

    if (stdOut) {
        const packageJson = require(pathJoin(__dirname, '../package.json')) as {bin: object}
        const [[binName]] = Object.entries(packageJson.bin) // retrieves first binary property value from package.json file

        console.log(stdOut.replace(/\bquicktype\b/g, binName)) // replaces all all references to quicktype in help output with quicktypemst name
    }

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
