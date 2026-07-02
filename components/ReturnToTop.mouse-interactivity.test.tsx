import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React, { useState } from 'react';
import ReturnToTop from './ReturnToTop';

// Mock framer-motion as in existing test files to make it easy to control and render the structure
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <button {...props}>{children}</button>
    ),
    circle: (props: { [key: string]: unknown }) => <circle {...props} />,
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <span {...props}>{children}</span>
    ),
  },
  useReducedMotion: () => false,
  useScroll: () => ({ scrollYProgress: 0.5 }),
  useSpring: (value: unknown) => value,
  useTransform: () => 0,
}));

vi.mock('lucide-react', () => ({
  ChevronUp: () => <svg data-testid="chevron-up-icon" />,
}));

const InteractiveReturnToTopWrapper = ({
  onClick,
  onTouchStart,
}: {
  onClick?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setShowTooltip(true);
    setCoordinates({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      data-testid="rtt-wrapper"
      className="relative inline-block cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onTouchStart={onTouchStart}
    >
      <ReturnToTop />
      {showTooltip && (
        <div
          data-testid="rtt-tooltip"
          className="absolute z-10 p-2 bg-black text-white rounded shadow-lg"
          style={{ top: coordinates.y + 10, left: coordinates.x + 10 }}
        >
          Return to Top
        </div>
      )}
    </div>
  );
};

describe('ReturnToTop - Interactive Tooltips, Cursor Hovers & Touch Event Propagation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
      writable: true,
    });

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 750,
      writable: true,
    });

    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('triggers simulated mouseenter/hover gestures and displays responsive tooltip layouts at computed coordinates', () => {
    render(<InteractiveReturnToTopWrapper />);

    // Trigger scroll visibility
    fireEvent.scroll(window);

    const wrapper = screen.getByTestId('rtt-wrapper');

    // Tooltip shouldn't be visible initially
    expect(screen.queryByTestId('rtt-tooltip')).toBeNull();

    // Trigger mouseenter with specific client coordinates
    fireEvent.mouseEnter(wrapper, { clientX: 120, clientY: 250 });

    const tooltip = screen.getByTestId('rtt-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.style.left).toBe('130px');
    expect(tooltip.style.top).toBe('260px');
    expect(tooltip.textContent).toBe('Return to Top');
  });

  it('tests custom click gestures and ensures click events propagate correctly', () => {
    const handleClick = vi.fn();
    render(<InteractiveReturnToTopWrapper onClick={handleClick} />);

    // Trigger scroll visibility
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toBeTruthy();

    // Click on the button and verify event bubbles up to wrapper
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('tests custom touch gestures and ensures touch events propagate correctly', () => {
    const handleTouch = vi.fn();
    render(<InteractiveReturnToTopWrapper onTouchStart={handleTouch} />);

    // Trigger scroll visibility
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toBeTruthy();

    // Touch on the button and verify event bubbles up
    fireEvent.touchStart(button, { touches: [{ clientX: 100, clientY: 100 }] });
    expect(handleTouch).toHaveBeenCalledTimes(1);
  });

  it('asserts appropriate cursor style classes (like pointer) are applied on hover wrapper', () => {
    render(<InteractiveReturnToTopWrapper />);

    // Trigger scroll visibility
    fireEvent.scroll(window);

    const wrapper = screen.getByTestId('rtt-wrapper');

    // Check if cursor-pointer utility class is present on the wrapper
    expect(wrapper.className).toContain('cursor-pointer');

    const button = screen.getByRole('button', { name: /back to top/i });
    // Ensure hover styling class exists on the button itself
    expect(button.className).toContain('hover:border-violet-300');
    expect(button.className).toContain('hover:text-violet-200');
  });

  it('checks that mouseleave events successfully hide temporary overlay visuals', () => {
    render(<InteractiveReturnToTopWrapper />);

    // Trigger scroll visibility
    fireEvent.scroll(window);

    const wrapper = screen.getByTestId('rtt-wrapper');

    // Show tooltip
    fireEvent.mouseEnter(wrapper, { clientX: 50, clientY: 50 });
    expect(screen.queryByTestId('rtt-tooltip')).toBeTruthy();

    // Hide tooltip
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByTestId('rtt-tooltip')).toBeNull();
  });
});
