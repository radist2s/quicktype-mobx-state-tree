import {
    TypeScriptRenderer,
    TypeScriptTargetLanguage,
    RenderContext,
    getOptionValues,
    tsFlowOptions,
    ClassType,
    Name,
    Type,
    modifySource,
    ClassProperty,
    Sourcelike,
    matchType,
    TargetLanguage,
    panic,
    nullableFromUnion,
    defined,
    Option
} from 'quicktype/dist/quicktype-core'
import {utf16StringEscape} from 'quicktype/dist/quicktype-core/support/Strings'
import {isES3IdentifierStart} from 'quicktype/dist/quicktype-core/language/JavaScriptUnicodeMaps'
import {legalizeName} from 'quicktype/dist/quicktype-core/language/JavaScript'
import {MultiWord, singleWord, parenIfNeeded} from 'quicktype/dist/quicktype-core/Source'
import {OptionValues, BooleanOption} from 'quicktype/dist/quicktype-core/RendererOptions'
import {TypeKind} from 'quicktype/dist/quicktype-core/Type'
import {ConvertersOptions} from 'quicktype/dist/quicktype-core/support/Converters'

export const mstOptions =  {
    runtimeConverterTypes: new BooleanOption("runtime-type-converters", "Normalize string data such 'Date' to valid MST snapshot format at runtime", true),
    nicePropertyNames: tsFlowOptions.nicePropertyNames,
    acronymStyle: tsFlowOptions.acronymStyle,
    converters: tsFlowOptions.converters
} as const

export class MobXStateTreeTargetLanguage extends TypeScriptTargetLanguage {
    constructor(
        readonly displayName: string = 'MobX-State-Tree',
        readonly names: string[] = ['mobx', 'mst', 'ts', 'tsx', 'js', 'jsx'],
        readonly extension: string = 'ts'
    ) {
        super()
    }

    protected makeRenderer(
        renderContext: RenderContext,
        untypedOptionValues: {[name: string]: any}
    ): MobXStateTreeRenderer {
        untypedOptionValues = Object.assign({}, untypedOptionValues, {
            // [tsFlowOptions.justTypes.definition.name]: String(true),
            [tsFlowOptions.declareUnions.definition.name]: String(false), // set to false, MST has builtin support fot union types
            [tsFlowOptions.runtimeTypecheck.definition.name]: String(false) // set to false, MST has builtin support for type checking
        })

        const typedOptions = {
            ...getOptionValues(mstOptions, untypedOptionValues)
        }

        return new MobXStateTreeRenderer(this, renderContext, typedOptions)
    }

    protected getOptions(): Option<any>[] {
        return Object.values(mstOptions)
    }
}

function quotePropertyName(original: string): string {
    const escaped = utf16StringEscape(original)
    const quoted = `"${escaped}"`

    if (original.length === 0) {
        return quoted
    } else if (!isES3IdentifierStart(original.codePointAt(0) as number)) {
        return quoted
    } else if (escaped !== original) {
        return quoted
    } else if (legalizeName(original) !== original) {
        return quoted
    } else {
        return original
    }
}

export class MobXStateTreeRenderer extends TypeScriptRenderer {
    private readonly _mstOptions: OptionValues<typeof mstOptions>

    constructor(
        targetLanguage: TargetLanguage,
        renderContext: RenderContext,
        options: OptionValues<typeof mstOptions>
    ) {
        const {runtimeConverterTypes, ...optionsRest} = options as OptionValues<(typeof mstOptions & typeof tsFlowOptions)>

        super(targetLanguage, renderContext, optionsRest)

        this._mstOptions = options
    }

    protected emitClassBlock(c: ClassType, className: Name): void {
        this.emitBlock(['export const ', className, ` = types.model('`, className, `', `], ')', () => {
            this.emitClassBlockBody(c)
        })
    }

    protected emitClassBlockBody(c: ClassType): void {
        this.emitPropertyTable(c, (name, _jsonName, p) => {
            const t = p.type
            return [
                [modifySource(quotePropertyName, name), ': ', p.isOptional ? 'types.maybe(' : ''],
                [this.sourceFor(t).source, p.isOptional ? ')' : '', ',']
            ]
        })
    }

    protected sourceFor(t: Type): MultiWord {
        if (['class', 'object'].indexOf(t.kind) >= 0) {
            return singleWord(this.nameForNamedType(t))
        }

        return matchType<MultiWord>(
            t,
            _anyType => singleWord('types.frozen()'),
            _nullType => singleWord('types.null'),
            _boolType => singleWord('types.boolean'),
            _integerType => singleWord('types.number'),
            _doubleType => singleWord('types.number'),
            _stringType => singleWord('types.string'),
            arrayType => {
                const itemType = this.sourceFor(arrayType.items)

                return singleWord(['types.array(', parenIfNeeded(itemType), ')'])
            },
            _classType => panic('We handled this above'),
            mapType => singleWord(['types.frozen()']),
            _enumType => {
                const itemTypeName = this.nameForNamedType(_enumType)

                return singleWord([
                    'types.enumeration<',
                    itemTypeName,
                    `>('`,
                    itemTypeName,
                    `', `,
                    `Object.values(`,
                    itemTypeName,
                    `))`
                ])
            },
            unionType => {
                if (true/*!this._mstOptions.declareUnions*/ || nullableFromUnion(unionType) !== null) {
                    const uniqueChildren = Array.from(unionType.getChildren()).filter(function (
                        filteringChild,
                        index,
                        children
                    ) {
                        if (!filteringChild.isPrimitive()) {
                            return true
                        }

                        return index == children.findIndex(findChildren => findChildren.kind === filteringChild.kind)
                    })

                    const childrenSeparated = uniqueChildren.reduce<Sourcelike[]>((carry, childType) => {
                        // Join union children with comma if not first children is preparing
                        if (carry.length) {
                            carry = carry.concat(', ')
                        }

                        // filter out same kind union child types
                        const childSource = this.sourceFor(childType)

                        if (carry.find((carryType: Sourcelike | Type) => carryType === childType)) {
                            return carry
                        }
                        return carry.concat(parenIfNeeded(childSource))
                    }, [])
                    return singleWord(['types.union(', ...childrenSeparated, ')'])
                } else {
                    return singleWord(this.nameForNamedType(unionType))
                }
            },
            transformedStringType => {
                if (transformedStringType.kind === 'date-time') {
                    return singleWord('types.Date')
                }

                return singleWord('string')
            }
        )
    }

    protected makeNameForTopLevel(t: Type, givenName: string, maybeNamedType: Type | undefined): Name {
        const givenNameOrder = 100
        const inferredOrder = 100
        return (this as any).makeNameForType(t, defined((this as any)._namedTypeNamer), givenNameOrder, inferredOrder)
    }

    protected makeNameForNamedType(t: Type): Name {
        const givenNameOrder = 10

        type OrderMap = Extract<TypeKind, 'object' | 'enum'>

        const orders: {[key in OrderMap]: number} = {
            object: 10,
            enum: 5
        }

        const inferredNameOrder = orders[t.kind as OrderMap] !== undefined ? orders[t.kind as OrderMap] : 30

        return (this as any).makeNameForType(
            t,
            defined((this as any)._namedTypeNamer),
            givenNameOrder,
            inferredNameOrder
        )
    }

    protected emitSourceStructure() {
        this.emitLine("import {types} from 'mobx-state-tree'")
        this.ensureBlankLine()
        super.emitSourceStructure()
    }

    protected emitTypes(): void {
        this.forEachNamedType(
            'leading-and-interposing',
            (c: ClassType, n: Name) => {
                this.emitDescription(this.descriptionForType(c))
                this.emitClassBlock(c, n)
            },
            (e, n) => this.emitEnum(e, n),
            (u, n) => this.emitUnion(u, n)
        )
    }

    protected get needsTypeDeclarationBeforeUse() {
        return true
    }

    protected canBeForwardDeclared(t: Type): boolean {
        return (['enum', 'object'] as TypeKind[]).indexOf(t.kind) !== -1
    }

    protected emitConvertModuleBody(): void {
        const converter = (t: Type, name: Name) => {
            // const typeMap = this.typeMapTypeFor(t)

            this.emitBlock([this.deserializerFunctionLine(t, name), ' '], '', () => {
                if (true/*!this._mstOptions.runtimeTypecheck*/) {
                    this.emitLine('return JSON.parse(json);')
                } else {
                    // this.emitLine('return cast(JSON.parse(json), ', typeMap, ');')
                }
            })

            this.ensureBlankLine()

            this.emitBlock([this.serializerFunctionLine(t, name), ' '], '', () => {
                if (true/*!this._mstOptions.runtimeTypecheck*/) {
                    this.emitLine('return JSON.stringify(value);')
                } else {
                    // this.emitLine('return JSON.stringify(uncast(value, ', typeMap, '), null, 2);')
                }
            })
        }

        switch (this._mstOptions.converters) {
            case ConvertersOptions.AllObjects:
                this.forEachObject('interposing', converter)
                break

            default:
                this.forEachTopLevel('interposing', converter)
                break
        }
    }
}
