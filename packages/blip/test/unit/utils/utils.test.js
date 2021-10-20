
import { expect } from "chai";

import utils from "../../../app/core/utils";

describe("utils", () => {
  it("waitTimeout shoud return a promise", (done) => {
    const val = utils.waitTimeout(1);
    expect(val).instanceOf(Promise);
    val.then(done);
  });
});
