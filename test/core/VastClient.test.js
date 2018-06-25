import VastClient from "src/core/VastClient";
import vastXml from "../../fakeserver/public/vast.xml";
describe("Vast client", function() {
  it("should get link in constructor", function() {
    let vastClient = new VastClient("http://google.com");
  });
});
