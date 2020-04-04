let originalStdoutWrite: undefined | typeof process.stdout.write

export default async function captureStdOut<P>(callback: () => P | Promise<P>): Promise<[P, string] | []> {
    originalStdoutWrite = originalStdoutWrite || process.stdout.write.bind(process.stdout)

    let stdOutput = ''

    process.stdout.write = (chunk: Buffer | string): boolean => {
        if (typeof chunk === 'string') {
            stdOutput += chunk
        }

        return true
    }

    const stopCapture = function () {
        if (originalStdoutWrite) {
            process.stdout.write = originalStdoutWrite
        }

        return stdOutput
    }

    return [await callback(), stopCapture()]
}
