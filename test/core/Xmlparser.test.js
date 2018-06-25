import xmlParser from "src/core/xmlParser.js";
describe("xmlParser", function() {
  it("should parse the xml into json", function() {
    const xml = `<person type='student'><name>Hadi</name><url><![CDATA[http://google.com]]></url><scores><score name="math">2</score><score>4</score><kooft>4</kooft></scores></person>`;
    const json = {
      person: {
        "@type": "student",
        name: { "#text": "Hadi" },
        url: { "#text": "http://google.com" },
        scores: {
          score: [{ "@name": "math", "#text": "2" }, { "#text": "4" }],
          kooft: { "#text": "4" }
        }
      }
    };
    const actual = xmlParser(xml);
    expect(actual).to.be.deep.include(json);
  });
});
