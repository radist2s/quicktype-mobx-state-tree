quicktype-mobx-state-tree
=========================

Quicktype to Mobx State Tree bindings

[![Version](https://img.shields.io/npm/v/quicktype-mobx-state-tree.svg)](https://npmjs.org/package/quicktype-mobx-state-tree)
[![Downloads/week](https://img.shields.io/npm/dw/quicktype-mobx-state-tree.svg)](https://npmjs.org/package/quicktype-mobx-state-tree)
[![License](https://img.shields.io/npm/l/quicktype-mobx-state-tree.svg)](https://github.com/radist2s/quicktype-mobx-state-tree/blob/master/package.json)

# About

`quicktypemst` generates strongly-typed MobX State Tree models from JSON, JSON Schema, and [GraphQL queries](https://blog.quicktype.io/graphql-with-quicktype/), making it a breeze to work with JSON type-safely.

Based on [`quicktype`](https://quicktype.io/). To use `quicktypemst` effectively, it is better to read original [quicktype documentation](https://github.com/quicktype/quicktype) first.

# Installation

### Install globally
```bash
$ npm install -g @radist2s/quicktype-mobx-state-tree
```


### Install locally
```bash
$ npm install @radist2s/quicktype-mobx-state-tree --save-dev
```

# CLI Usage
```bash
$ quicktypemst [--out FILE] FILE|URL ...
$ quicktypemst --help
```

# Examples
#### JSON to MST
```bash
$ quicktypemst https://blockchain.info/latestblock -o latestblock.ts
```
Output file: `latestblock.ts`
```javascript
/* tslint:disable */
import {types} from 'mobx-state-tree'

export const Latestblock = types.model('Latestblock', {
    hash:        types.string,
    time:        types.number,
    block_index: types.number,
    height:      types.number,
    txIndexes:   types.array(types.frozen()),
})
```

#### JSON Schema to MST
Input file: `types.schema.json`
```
{
    "$id": "types.schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "number": {
            "type": "integer"
        },
        "string": {
            "type": "string"
        },
        "date": {
            "type": "string",
            "format": "date-time"
        },
        "enum": {
            "type": "string",
            "enum": ["first", "second", "third"],
            "default": "first"
        }
    }
}

```
Command
```bash
$ quicktypemst -s schema types.schema.json -o types.ts
```
Output file: `types.ts`
```typescript
import {types} from 'mobx-state-tree'

export enum Enum {
    First = 'first',
    Second = 'second',
    Third = 'third'
}

export const Types = types.model('Types', {
    date: types.maybe(types.Date),
    enum: types.maybe(types.enumeration<Enum>('Enum', Object.values(Enum))),
    number: types.maybe(types.number),
    string: types.maybe(types.string)
})
```
#### Custom `types` module source
Sometimes you may need to use custom types for models.
For example, let's override `Date` type by custom type with snapshot pre and postprocessors.
The example below will allow you to apply JSON snapshots with the specified date as string in format like `2020-04-04T19:34:58.843Z` 
```bash
$ quicktypemst -s schema types.schema.json -o types.ts --types-module ./my-types.ts
```
Output file: `types.ts`
```typescript
import {types} from './my-types'

...
```
Custom types module file: `my-types.ts`
```typescript
import {types as mstTypes} from 'mobx-state-tree'

type DateSnapshotType = string | null
type DateType = Date | null

export function typeDate() {
    return mstTypes.custom<DateSnapshotType, DateType>({
        name: 'Date',
        fromSnapshot(snapshot: DateSnapshotType): DateType {
            return snapshot === null ? null : new Date(snapshot)
        },
        getValidationMessage(snapshot: string | null): string {
            const isValidTimestamp = snapshot === null || /[^\d\.]+/.test(String(snapshot))

            return isValidTimestamp ? '' : `'${snapshot}' doesn't look like a valid timestamp`
        },
        isTargetType(value: DateSnapshotType | DateType): boolean {
            return value instanceof Date || value === null
        },
        toSnapshot(value: DateType): DateSnapshotType {
            return value ? value.toISOString() : null
        }
    })
}

const {Date: MstDate, ...mstPartialProps} = mstTypes

export const types = {
    ...mstPartialProps,
    get Date() {
        return typeDate()
    }
}
```

### Project `npm` automation
`package.json`
```json
{
    "scripts": {
        "gen-models": "quicktypemst -s schema --src src/rest.schema.json -o build/gen/rest.ts --types-module src/custom-types.ts"
    }
}
```
##### Usage
```bash
$ npm run gen-models
```
