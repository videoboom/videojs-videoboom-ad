import VastDownlaoder from "src/core/VastDownloader.js";
import vastXml from "../../fakeserver/public/vast.xml";
describe("Vast Downloader", function() {
  it("should get xml from Url", async function() {
    let actual = await VastDownlaoder("http://localhost:4000/vast.xml");
    expect(actual).to.be.equal(vastXml);
  });
});
