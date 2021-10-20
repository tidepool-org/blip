import React from "react";
import { expect } from "chai";
import * as sinon from "sinon";
import { shallow } from "enzyme";

import Messages from "../../../../app/components/messages";

describe("Messages", function () {
  before(() => {
    sinon.stub(console, "error").callsFake(console.log.bind(console));
  });

  after(() => {
    sinon.restore();
  });

  it("should be exposed as a module and be of type function", function() {
    expect(Messages).to.be.a("function");
  });

  describe("render", function() {
    it("should render without problems when required props are present", function () {
      const props = {
        timePrefs: {
          timezoneName: "UTC",
        },
        user: {},
        patient: {},
        onClose: sinon.spy(),
        onSave: sinon.spy(),
        onEdit: sinon.spy(),
        trackMetric: sinon.spy(),
      };
      const elem = shallow(<Messages {...props} />);
      expect(elem.exists(".messages")).to.be.true;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe("Initial State", function() {
    it("should equal expected initial state", function() {
      const props = {
        timePrefs: {
          timezoneName: "UTC",
        },
        user: {},
        patient: {},
        onClose: sinon.spy(),
        onSave: sinon.spy(),
        onEdit: sinon.spy(),
        trackMetric: sinon.spy(),
        messages : [],
      };
      const elem = shallow(<Messages {...props} />);
      const state = elem.instance().state;
      expect(state.messages).to.deep.equal(props.messages);
    });
  });
});
