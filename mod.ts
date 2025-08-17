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
          "@context": ["http://www.w3.org/ns/csvw", {"@language": "en"}],
          "tables": [{
            "url": "http://opendata.leeds.gov.uk/downloads/gritting/grit_bins.csv",
            "tableSchema": {
              "columns": [
              {
                "name": "location",
                "datatype": "integer"
              },
              {
                "name": "easting",
                "datatype": "decimal",
                "propertyUrl": "http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting"
              },
              {
                "name": "northing",
                "datatype": "decimal",
                "propertyUrl": "http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing"
              }
              ],
              "aboutUrl": "#{location}"
            }
          }],
          "dialect": {
            "header": false
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
`42,425584,439562
43,425301,439519
44,425379,439596
45,425024,439663
46,424915,439697
48,425157,440347
49,424784,439681
50,424708,439759
51,424913,440642
52,425342,440376`
    ])
)

const writer = new StreamWriter()
stream.pipe(writer)

console.log(
    (await writer.toArray()).join("")
)