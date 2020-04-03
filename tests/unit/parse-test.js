/* eslint-env mocha */
import { expect } from 'chai'

import parse from '../../src/parse'
import sparqlUpdateParser from '../../src/patch-parser'
import { graph } from '../../src/data-factory'

describe('Parse', () => {
  describe('ttl', () => {
    describe('literals', () => {
      it('handles language subtags', () => {
        let base = 'https://www.wikidata.org/wiki/Special:EntityData/Q2005.ttl'
        let mimeType = 'text/turtle'
        let store = graph()
        let content = '<http://www.wikidata.org/entity/Q328> <http://www.w3.org/2000/01/rdf-schema#label> "ангельская Вікіпэдыя"@be-x-old .'
        parse(content, store, base, mimeType)
        expect(store.statements[0].object.lang).to.eql('be-x-old')
      })
    })
  })
  describe('ttl with charset', () => {
    describe('literals', () => {
      it('handles language subtags', () => {
        let base = 'https://www.wikidata.org/wiki/Special:EntityData/Q2005.ttl'
        let mimeType = 'text/turtle;charset=UTF-8'
        let store = graph()
        let content = '<http://www.wikidata.org/entity/Q328> <http://www.w3.org/2000/01/rdf-schema#label> "ангельская Вікіпэдыя"@be-x-old .'
        parse(content, store, base, mimeType)
        expect(store.statements[0].object.lang).to.eql('be-x-old')
      })
    })
  })
  describe('a JSON-LD document', () => {
    describe('with a base IRI', () => {
      let store
      before(done => {
        const base = 'https://www.example.org/abc/def'
        const mimeType = 'application/ld+json'
        const content = `
        {
          "@context": {
            "homepage": {
              "@id": "http://xmlns.com/foaf/0.1/homepage",
              "@type": "@id"
            }
          },
          "@id": "../#me",
          "homepage": "xyz"
        }`
        store = graph()
        parse(content, store, base, mimeType, done)
      })

      it('uses the specified base IRI', () => {
        expect(store.statements).to.have.length(1);
        const statement = store.statements[0]
        expect(statement.subject.value).to.equal('https://www.example.org/#me')
        expect(statement.object.value).to.equal('https://www.example.org/abc/xyz')
      })
    })
  })
  describe('sparlq-update', () => {
    it('parses a query into the store as subgraphs', () => {
      // FIXME: are subgraphs allowed in RDF?
      // See https://github.com/linkeddata/rdflib.js/pull/401
      let base = 'https://example.com/'
      let mimeType = 'application/sparql-update'
      console.log(mimeType)
      let store = graph()
      let content = 'INSERT DATA { <https://example.com/#s> <https://example.com/#p> <https://example.com/#o>. }'
      parse(content, store, base, mimeType)
      expect(store.toNT()).to.eql('{<https://example.com/#query> <http://www.w3.org/ns/pim/patch#insert> {<https://example.com/#s> <https://example.com/#p> <https://example.com/#o> .} .}')
    })
  })
})

describe('sparlqUpdateParser', () => {
  it('adds a triple to insert graph of patch object', () => {
    let base = 'https://example.com/'
    let mimeType = 'application/sparql-update'
    console.log(mimeType)
    let store = graph()
    let content = 'INSERT DATA { <https://example.com/#s> <https://example.com/#p> <https://example.com/#o>. }'
    const patchObject = sparqlUpdateParser(content, store, base)
    expect(patchObject.insert.toNT()).to.eql('{<https://example.com/#s> <https://example.com/#p> <https://example.com/#o> .}')
  })
})
