import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export function InputNumber({ inputValue, setInputValue }) {
  const [rawInput, setRawInput] = useState(inputValue?.toString() || "");

  useEffect(() => {
    setRawInput(inputValue);
  }, [inputValue]);

  const handleInputChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^0-9.-]/g, "");

    setRawInput(value);

    // Пытаемся преобразовать значение в число и передаем только валидированные числа
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setInputValue(parsedValue);
    } else {
      setInputValue(null); // Для невалидного ввода можно сбросить значение
    }
  };

  return (
    <input
      type="number" // Используем text, чтобы не ограничивать ввод только числовыми символами
      inputMode="decimal" // Ensures only number keyboard appears
      pattern="[0-9]*" // For older mobile browsers
      placeholder="0"
      value={rawInput}
      onChange={handleInputChange}
    />
  );
}

InputNumber.propTypes = {
  inputValue: PropTypes.number.isRequired,
  setInputValue: PropTypes.func.isRequired,
};
