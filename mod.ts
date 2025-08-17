// @ts-types="http://esm.sh/@types/rdf-parser-csvw@0.15.0"
import ParserCSVW from "https://esm.sh/rdf-parser-csvw@1.0.3"

import { DataFactory, Parser, StreamWriter, Store, type Quad } from "https://esm.sh/n3@1.26.0"
const { namedNode, literal, defaultGraph, quad } = DataFactory

// @ts-types="https://esm.sh/@types/node@24.3.0/stream.d.ts"
import { Readable } from "node:stream"

import ParserJsonld from "https://esm.sh/@rdfjs/parser-jsonld@2.1.3"

const myQuad = quad(
    namedNode("subject"),
    namedNode("predicate"),
    literal("object"),
    defaultGraph(),
)

const parsedJsonld = new ParserJsonld().import(
    Readable.from([
        JSON.stringify({
          "@context": "http://www.w3.org/ns/csvw",
          "url": "test001-minimal.csv",
          "tableSchema": {
            "aboutUrl": "http://example.org/id/{ID}",
            "columns": [
              {
                "titles": "ID",
                "propertyUrl": "http://vocab.example.org/id"
              },
              {
                "titles": "String",
                "propertyUrl": "http://vocab.example.org/string"
              },
              {
                "titles": "Int",
                "propertyUrl": "http://vocab.example.org/int"
              },
              {
                "titles": "Reference",
                "propertyUrl": "http://vocab.example.org/reference"
              }
            ]
          }
        })
    ])
)

class JReadable extends Readable {
    constructor() {
        super({ objectMode: true })
        parsedJsonld.on("data", quad => this.push(quad))
        parsedJsonld.on("finish", () => this.push(null))
    }
    override _read() { }
}

const r = await new JReadable().toArray()
console.log(r)

const store = new Store(r)

const parser = new ParserCSVW({
    metadata: store
})

const stream = parser.import(
    Readable.from([
`ID,String,Int,Reference
234345,Der Tag ist noch lang,12,234.1123
343555,Die nacht wird kurz,14,234.4323
234665,Jäää,53,777.4858`
    ])
)

const writer = new StreamWriter()
stream.pipe(writer)

console.log(
    (await writer.toArray()).join("")
)