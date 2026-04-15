/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */
/* global jest */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SlideShow, SlideShowItem } from '../../../../app/components/elements/SlideShow/SlideShow';

const mockUseSnapCarousel = {
  scrollRef: { current: null },
  pages: [[0], [1], [2]],
  activePageIndex: 0,
  hasPrevPage: false,
  hasNextPage: true,
  snapPointIndexes: new Set([0, 1, 2]),
  next: jest.fn(),
  prev: jest.fn(),
  goTo: jest.fn(),
};

jest.mock('react-snap-carousel', () => ({
  useSnapCarousel: () => mockUseSnapCarousel,
}));

const items = [
  { title: 'Slide 1', content: 'Content 1' },
  { title: 'Slide 2', content: 'Content 2' },
  { title: 'Slide 3', content: 'Content 3' },
];

const renderItem = ({ item }) => (
  <div key={item.title}>
    <h2>{item.title}</h2>
    <p>{item.content}</p>
  </div>
);

describe('SlideShow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state for each test
    Object.assign(mockUseSnapCarousel, {
      activePageIndex: 0,
      hasPrevPage: false,
      hasNextPage: true,
    });
  });

  it('renders the slideshow with items', () => {
    render(<SlideShow items={items} renderItem={renderItem} />);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('calls next when the next button is clicked', () => {
    render(<SlideShow items={items} renderItem={renderItem} />);
    fireEvent.click(screen.getByLabelText('Next'));
    expect(mockUseSnapCarousel.next).toHaveBeenCalledTimes(1);
  });

  it('calls prev when the previous button is clicked', () => {
    mockUseSnapCarousel.hasPrevPage = true;
    mockUseSnapCarousel.activePageIndex = 1;
    render(<SlideShow items={items} renderItem={renderItem} />);
    fireEvent.click(screen.getByLabelText('Previous'));
    expect(mockUseSnapCarousel.prev).toHaveBeenCalledTimes(1);
  });

  it('disables the previous button on the first slide', () => {
    render(<SlideShow items={items} renderItem={renderItem} />);
    expect(screen.getByLabelText('Previous')).toBeDisabled();
  });

  it('disables the next button on the last slide', () => {
    mockUseSnapCarousel.hasNextPage = false;
    mockUseSnapCarousel.activePageIndex = 2;
    render(<SlideShow items={items} renderItem={renderItem} />);
    expect(screen.getByLabelText('Next')).toBeDisabled();
  });

  it('calls goTo when a pagination dot is clicked', () => {
    render(<SlideShow items={items} renderItem={renderItem} />);
    fireEvent.click(screen.getByText('2')); // Click on the second pagination dot
    expect(mockUseSnapCarousel.goTo).toHaveBeenCalledWith(1);
  });

  it('handles ArrowRight key press for horizontal axis', () => {
    render(<SlideShow items={items} renderItem={renderItem} axis="x" />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockUseSnapCarousel.next).toHaveBeenCalledTimes(1);
  });

  it('handles ArrowLeft key press for horizontal axis', () => {
    render(<SlideShow items={items} renderItem={renderItem} axis="x" />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockUseSnapCarousel.prev).toHaveBeenCalledTimes(1);
  });

  it('handles ArrowDown key press for vertical axis', () => {
    render(<SlideShow items={items} renderItem={renderItem} axis="y" />);
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(mockUseSnapCarousel.next).toHaveBeenCalledTimes(1);
  });

  it('handles ArrowUp key press for vertical axis', () => {
    render(<SlideShow items={items} renderItem={renderItem} axis="y" />);
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(mockUseSnapCarousel.prev).toHaveBeenCalledTimes(1);
  });
});

describe('SlideShowItem', () => {
  it('renders with all props provided', () => {
    render(
      <SlideShowItem
        isSnapPoint={true}
        title="Test Title"
        content="Test content description"
        image="/test-image.jpg"
        imageAlt="Test image"
        id="test-slide-1"
      />
    );

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    const content = screen.getByRole('article');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test content description');
    expect(screen.getByRole('img', { name: 'Test image' })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveAttribute('id', 'test-slide-1');
  });

  it('renders with minimal props', () => {
    render(<SlideShowItem isSnapPoint={false} />);

    // Should render the container without throwing errors
    expect(screen.getByRole('listitem')).toBeInTheDocument();

    // Should not render title, content, or image sections
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders content sections conditionally', () => {
    // Test with only content, no title
    const { rerender } = render(
      <SlideShowItem
        isSnapPoint={true}
        content="Only content here"
      />
    );

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    // Test with only title, no content
    rerender(
      <SlideShowItem
        isSnapPoint={true}
        title="Only title here"
      />
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    // Test with only image, no content
    rerender(
      <SlideShowItem
        isSnapPoint={true}
        image="/test-image.jpg"
        imageAlt="Test image"
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});


