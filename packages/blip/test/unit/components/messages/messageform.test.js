import React from "react";
import { expect } from "chai";
import * as sinon from "sinon";
import { shallow } from "enzyme";

import MessageForm from "../../../../app/components/messages/messageform";

describe("MessageForm", function () {

  before(() => {
    sinon.stub(console, "error").callsFake(console.log.bind(console));
  });

  after(() => {
    sinon.restore();
  });

  it("should be exposed as a module and be of type function", function() {
    expect(MessageForm).to.be.a("function");
  });

  describe("getInitialState", function() {
    it("should equal expected initial state", function() {
      const props = {
        timePrefs: {
          timezoneName: "UTC",
        },
      };
      const elem = shallow(<MessageForm {...props} />);
      const state = elem.instance().state;

      expect(console.error.callCount).to.equal(0);
      const expectedState = {
        msg: "",
        when: null,
        date: null,
        originalDate: null,
        time: null,
        originaltime: null,
        editing: false,
        saving: false,
        changeDateTime: false,
        rows: 1,
      };
      expect(state, JSON.stringify({ state, expectedState }, null, 2)).to.deep.equal(expectedState);
    });
  });
});
