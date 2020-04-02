/* eslint-env mocha */
import { expect } from 'chai'

import parse from '../../src/parse'
import { graph } from '../../src/data-factory'
import { SPARQLUpdateContentType } from '../../src/types'
import DataFactory from '../../src/factories/rdflib-data-factory'

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
    it.only('add a triple to an empty document', () => {
      let base = 'https://example.com/'
      let mimeType = SPARQLUpdateContentType
      console.log(mimeType)
      let store = DataFactory.graph()
      let content = 'INSERT DATA { <https://example.com/#s> <https://example.com/#p> <https://example.com/#o>. }'
      parse(content, store, base, mimeType)
      expect(store.statements[0]).to.eql([])
    })
  })
})
