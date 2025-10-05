// web/src/hooks/__tests__/useClipboard.test.ts
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with copied as false', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
  });

  it('copies text to clipboard using navigator.clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    let success: boolean = false;
    await act(async () => {
      success = await result.current.copyToClipboard('test text');
    });

    expect(success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
  });

  it('resets copied to false after 2 seconds', async () => {
    jest.useFakeTimers();

    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);

    jest.useRealTimers();
  });

  it('handles clipboard API errors gracefully', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useClipboard());

    let success: boolean = true;
    await act(async () => {
      success = await result.current.copyToClipboard('test text');
    });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to copy to clipboard:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
