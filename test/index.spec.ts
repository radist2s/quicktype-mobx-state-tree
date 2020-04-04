import {InputData, JSONSchemaInput, JSONSchemaStore, JSONSchema} from 'quicktype/dist/quicktype-core'
import {join as pathJoin, sep} from 'path'
import {readFileSync, unlinkSync, writeFileSync} from 'fs'
import {quicktype, resolveTypesModuleOption} from '../src'
import {isUnionType, getSnapshot} from 'mobx-state-tree'
import {
    IModelType,
    ModelPropertiesDeclarationToProperties,
    ModelPropertiesDeclaration
} from 'mobx-state-tree/dist/types/complex-types/model'
import {Options} from 'quicktype/dist/quicktype-core/Run'
import {mstOptions} from '../src/MobXStateTreeLanguage'

const schemaFilePath = pathJoin(__dirname, 'fixtures/product.schema.json')

class MyJSONSchemaStore extends JSONSchemaStore {
    async fetch(_address: string): Promise<JSONSchema | undefined> {
        return undefined
    }
}

async function getSchemaInput(path = schemaFilePath) {
    const schemaInput = new JSONSchemaInput(new MyJSONSchemaStore())

    const schemaName: string = 'Schema'

    // We could add multiple schemas for multiple types,
    // but here we're just making one type from JSON schema.
    await schemaInput.addSource({name: schemaName, schema: readFileSync(path).toString('utf-8')})

    const inputData = new InputData()

    inputData.addInput(schemaInput)

    return inputData
}

describe('transform', function () {
    it('should transform', async function () {
        expect(await quicktype({inputData: await getSchemaInput()})).toMatchSnapshot()
    })

    it('should import custom types module', async function () {
        const options: Partial<Options> = resolveTypesModuleOption(
            {
                inputData: await getSchemaInput(pathJoin(__dirname, 'fixtures/types.schema.json')),
                rendererOptions: {
                    [mstOptions.typesModule.definition.name]: 'src/types.ts'
                }
            },
            __dirname
        )

        expect(await quicktype(options)).toMatchSnapshot()
    })

    it('should load json snapshot', async function () {
        const options: Partial<Options> = resolveTypesModuleOption(
            {
                inputData: await getSchemaInput(),
                rendererOptions: {
                    [mstOptions.typesModule.definition.name]: 'src/types.ts'
                }
            },
            __dirname
        )

        const mstCode = await quicktype(options)

        const mstFilePath = `${__dirname}${sep}.${Math.floor(Math.random() * 100000)}.ts`

        let error: any

        try {
            writeFileSync(mstFilePath, mstCode)

            const mst = require(mstFilePath) as {Schema: IModelType<ModelPropertiesDeclarationToProperties<{}>, {}>}

            const Schema = mst.Schema

            const modelSnapshot = require('./fixtures/schema-snapshot.json')

            const schemaModel = Schema.create(modelSnapshot)

            expect(getSnapshot(schemaModel)).toMatchSnapshot()
        } catch (e) {
            error = e
        } finally {
            unlinkSync(mstFilePath)

            if (error) {
                throw error
            }
        }
    })
})
