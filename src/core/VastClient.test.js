const VastClient = require("../../core/vastClient");
describe("Vast client", function() {
  it("should get link in constructor", function() {
    vastClient = new VastClient("http://google.com");
  });
});
