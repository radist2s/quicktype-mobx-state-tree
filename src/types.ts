import {types as mstTypes} from 'mobx-state-tree'

function isNumericString(str?: string | null) {
    return typeof str === 'string' && /^[\d\.]+$/.test(str)
}

/**
 * Returns timestamp in milliseconds from parsed input literal or numeric seconds timestamp
 * @param timestamp
 */
function normalizeTimestampMs(timestamp: string | number | null): number | null {
    if (typeof timestamp === 'string') {
        if (isNumericString(timestamp)) {
            return parseFloat(timestamp) * 1000
        }

        return Date.parse(timestamp)
    } else if (typeof timestamp === 'number') {
        return timestamp * 1000
    }

    return null
}

type DateSnapshotType = string | number | null
type DateType = Date | null

export function typeDate() {
    return mstTypes.custom<DateSnapshotType, DateType>({
        name: 'Date',
        fromSnapshot(snapshot: DateSnapshotType): DateType {
            const timestampMs = normalizeTimestampMs(snapshot)

            return timestampMs === null ? null : new Date(timestampMs)
        },
        getValidationMessage(snapshot: string | null): string {
            const timestampMs = normalizeTimestampMs(snapshot)

            const isValidTimestamp = timestampMs === null || isFinite(timestampMs)

            return isValidTimestamp ? '' : `'${snapshot}' doesn't look like a valid literal timestamp or unix timestamp`
        },
        isTargetType(value: DateSnapshotType | DateType): boolean {
            return value instanceof Date || value === null
        },
        toSnapshot(value: DateType): Exclude<DateSnapshotType, number> {
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
