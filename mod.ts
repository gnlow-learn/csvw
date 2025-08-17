// @ts-types="http://esm.sh/@types/rdf-parser-csvw@0.15.0"
import Parser from "https://esm.sh/rdf-parser-csvw@1.0.3"

import { DataFactory, StreamWriter, Store } from "https://esm.sh/n3@1.26.0"

// @ts-types="https://esm.sh/@types/node@24.3.0/stream.d.ts"
import { Readable } from "node:stream"

const { namedNode, literal, defaultGraph, quad } = DataFactory

const myQuad = quad(
    namedNode("subject"),
    namedNode("predicate"),
    literal("object"),
    defaultGraph(),
)

const store = new Store([ myQuad ])

const parser = new Parser({
    metadata: store,
})

const stream = parser.import(
    Readable.from([
        "a,b\n10,20"
    ])
)

const writer = new StreamWriter()
stream.pipe(writer)

console.log(
    (await writer.toArray()).join("")
)