import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

// Re-export all enzyme exports
export * from 'enzyme';
