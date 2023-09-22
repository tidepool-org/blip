export default class LDClientMock {
  constructor(context = {}) {
    this.context = context;
  }

  getContext = () => this.context;

  identify = context => this.context = context;
};
