/**
 * http://programacao09:3333/docs/frontend/components/InputMaskReverse
 */
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

interface FakeEvent {
  target: {
    value: string;
  };
}

export const InputMaskDecimalReverse = ({
  prefix,
  suffix,
  unmask,
  scale,
  thousandsSeparator,
  radix,
  unmaskedRadix,
  startEmpty,

  value,

  onChange,
  onSelect,
  onFocus,

  ...props
}: {
  prefix: string;
  suffix: string;
  unmask: boolean;
  scale: number;
  thousandsSeparator: string;
  radix: string;
  unmaskedRadix: string;
  startEmpty?: boolean;

  value?: string;

  onChange?: (event: FakeEvent) => void;
  onSelect?: (event: React.SyntheticEvent<HTMLInputElement, Event>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  autoFocus?: boolean;
}) => {
  prefix = prefix || '';
  suffix = suffix || '';
  unmask = unmask || false;
  scale = typeof scale !== 'undefined' ? scale : 2; // quantidade de dígitos depois da virgula, use 0 para inteiros
  thousandsSeparator = thousandsSeparator || '.';
  radix = radix || ','; // delimitador de fração
  unmaskedRadix = unmaskedRadix || '.'; // caractere usado no replace do radix no unmask
  value = value || '';

  const ref = React.useRef<null | HTMLInputElement>(null);
  const [inputState, setInputState] = useState({
    maskedValue: '',
    unmaskedValue: '',
    selectionStart: 0,
    selectionEnd: 0,
  });

  const clearMask = useCallback(
    (value: string | undefined) => (typeof value === 'undefined' ? '' : value.replace(/[^\d]/g, '').replace(/^0+/, '')),
    []
  );

  const getFakeEvent = (unmaskedValue: string, maskedValue: string) => {
    const regex = new RegExp(`([0-9]+)([0-9]{${scale}})$`);

    return {
      target: {
        value: unmask ? unmaskedValue.replace(regex, '$1' + unmaskedRadix + '$2') : maskedValue,
      },
    };
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { value } }) => {
    const selectionStart = ref.current?.selectionStart || 0;
    const rightCursorText = value.slice(selectionStart, value.length);

    const { unmaskedValue, maskedValue } = getValues(value);

    let cursorPosition = maskedValue.length - rightCursorText.length;
    cursorPosition = cursorPosition < 0 ? 0 : cursorPosition;
    cursorPosition = cursorPosition < 0 ? 0 : cursorPosition;

    setInputState({
      maskedValue,
      unmaskedValue,
      selectionStart: cursorPosition,
      selectionEnd: cursorPosition,
    });

    const fakeEvent = getFakeEvent(unmaskedValue, maskedValue);
    if (onChange) onChange(fakeEvent);
  };

  const format = useCallback((value: string) => {
    value = clearMask(value);
    const minimumChars = scale + 1;
    value = value.padStart(minimumChars, '0');
    const formattedValue = value
      .split('')
      .reverse()
      .map((char, index) => {
        if (index - minimumChars >= 0 && (index - scale) % 3 === 0) {
          return char + thousandsSeparator;
        }
        return index === scale && scale > 0 ? char + radix : char;
      })
      .reverse()
      .join('');

    return prefix + formattedValue + suffix;
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    // mantém a posição do cursor entre as renderizações
    ref.current.selectionStart = inputState.selectionStart;
    ref.current.selectionEnd = inputState.selectionEnd;
  }, [inputState]);

  const getValues = (value: string | undefined) => {
    const unmaskedValue = clearMask(value);
    const maskedValue = format(unmaskedValue);

    return { unmaskedValue, maskedValue };
  };

  useEffect(() => {
    if (startEmpty && value === '') return;

    const { unmaskedValue, maskedValue } = getValues(value);

    const positions: { selectionStart?: number; selectionEnd?: number } = {};

    if (props.autoFocus) {
      positions.selectionStart = maskedValue.length;
      positions.selectionEnd = maskedValue.length;
    }

    setInputState({
      ...inputState,
      maskedValue,
      unmaskedValue,
      ...positions,
    });
  }, []);

  const inPrefix = (target: HTMLInputElement) => target.selectionStart && target.selectionStart < prefix.length;
  const limitCursorPosition = () => inputState.maskedValue.length - suffix.length;
  const inSuffix = (target: HTMLInputElement) => target.selectionEnd && target.selectionEnd > limitCursorPosition();

  const handleSelect: React.ReactEventHandler<HTMLInputElement> = (event) => {
    const { target } = event;
    const input = target as HTMLInputElement;

    if (inPrefix(input)) {
      const selectionEnd = {
        selectionEnd:
          input.selectionEnd && input.selectionEnd < prefix.length ? prefix.length : input.selectionEnd || 0,
      };

      setInputState({
        ...inputState,
        selectionStart: prefix.length,
        ...selectionEnd,
      });
    }

    const selectionStart = {
      selectionStart:
        input.selectionStart && input.selectionStart > limitCursorPosition()
          ? limitCursorPosition()
          : input.selectionStart || 0,
    };
    if (inSuffix(input)) {
      setInputState({
        ...inputState,
        ...selectionStart,
        selectionEnd: limitCursorPosition(),
      });
    }

    if (onSelect) onSelect(event);
  };

  const handleDrag: React.DragEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    const { unmaskedValue, maskedValue } = getValues(value);

    setInputState({
      maskedValue,
      unmaskedValue,
      selectionStart: maskedValue.length,
      selectionEnd: maskedValue.length,
    });

    if (onFocus) onFocus(event);
  };

  return (
    <input
      className="ant-input"
      value={inputState.maskedValue}
      ref={ref}
      style={{ textAlign: 'right' }}
      onChange={handleChange}
      onSelect={handleSelect}
      onFocus={handleFocus}
      onDragStart={handleDrag}
      {...props}
    />
  );
};
