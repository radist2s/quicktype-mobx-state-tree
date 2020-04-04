import {InputData, JSONSchemaInput, JSONSchemaStore, JSONSchema} from 'quicktype/dist/quicktype-core'
import {join as pathJoin, sep} from 'path'
import {readFileSync, writeFileSync, unlinkSync} from 'fs'
import {quicktype} from '../src'
import {types, isUnionType, isType, isPrimitiveType} from 'mobx-state-tree'
import {
    IModelType,
    ModelPropertiesDeclarationToProperties,
    ModelPropertiesDeclaration
} from 'mobx-state-tree/dist/types/complex-types/model'

const schemaFilePath = pathJoin(__dirname, 'fixtures/product.schema.json')

class MyJSONSchemaStore extends JSONSchemaStore {
    async fetch(_address: string): Promise<JSONSchema | undefined> {
        return undefined
    }
}

async function getSchemaInout() {
    const schemaInput = new JSONSchemaInput(new MyJSONSchemaStore())

    const schemaName: string = 'Schema'

    // We could add multiple schemas for multiple types,
    // but here we're just making one type from JSON schema.
    await schemaInput.addSource({name: schemaName, schema: readFileSync(schemaFilePath).toString('utf-8')})

    const inputData = new InputData()

    inputData.addInput(schemaInput)

    return inputData
}

function normalizeDate(date: string | number): string | undefined {
    if (typeof date === 'string') {
        if ((/[^\d\s]+/).test(date)) {
            return `${Date.parse(date) / 1000}`
        }

        return date
    }
    else if (typeof date === 'number') {
        return String(date)
    }
}

function isDateType(type: IModelType<ModelPropertiesDeclarationToProperties<{}>, {}>) {
    return type && typeof type === 'object' && type.name === 'Date'
}

function snapshotDateNormalize<P extends ModelPropertiesDeclaration = {}>(snapshot: {[key in keyof P]: any}, model: IModelType<ModelPropertiesDeclarationToProperties<P>, {}>) {
    const snapshotPrepared = {...snapshot}

    for (const [property, value] of Object.entries(snapshot)) {
        const propertyType: any = model.properties[property] as any

        if (propertyType) {
            let isDatePropertyType = false

            if (isUnionType(propertyType)) {
                const subTypes = propertyType.getSubTypes() as any[]

                isDatePropertyType = subTypes && subTypes.find(isDateType)
            }
            else if (isDateType(propertyType)) {
                isDatePropertyType = true
            }

            if (isDatePropertyType) {
                snapshotPrepared[property as keyof P] = normalizeDate(value)
            }
        }
        else {
            delete snapshotPrepared[property]
        }
    }

    return snapshotPrepared
}

describe('transform', function () {
    it('should transform', async function () {
        expect(await quicktype({inputData: await getSchemaInout()})).toMatchSnapshot()
    })

    /*it('should load json snapshot', async function () {

        const modelSnapshot = require('./fixtures/schema-snapshot.json')

        const mstCode = await quicktype({inputData: await getSchemaInout()})

        const mstFilePath = `${__dirname}${sep}.${Math.floor(Math.random() * 100000)}.ts`

        const d = Product.properties

        let error: any

        try {
            writeFileSync(mstFilePath, mstCode)

            const mst = require(mstFilePath) as {Schema: IModelType<ModelPropertiesDeclarationToProperties<{}>, {}>}

            const Schema = types.snapshotProcessor(mst.Schema, {
                preProcessor(snapshot: any) {
                    const data = snapshotDateNormalize(snapshot, mst.Schema)

                    return data
                }
            })

            const schemaModel = Schema.create(modelSnapshot)

            console.log(schemaModel)
        }
        catch (e) {
            error = e
        }
        finally {
            unlinkSync(mstFilePath)

            if (error) {
                throw error
            }
        }
    })*/
})
