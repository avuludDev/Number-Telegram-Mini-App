import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../libs/axios";
import { useTranslation } from "react-i18next";

export default function Live() {
  const [number, setNumber] = useState(0);
  const [displayNumber, setDisplayNumber] = useState(0); // Для анимации отображаемого числа
  const {t} = useTranslation();

  // Функция для запроса текущего значения
  const fetchLiveNumber = useCallback(async () => {
    try {
      const response = await axiosInstance
        .get(`/numbers`)
        .then((res) => res.data)
        .catch(() => 0);

      animateNumberChange(number, response); // Анимация перехода к новому значению
      setNumber(response);
    } catch (error) {
      console.error("Error fetching number:", error);
    }
  }, [number]);

  // Функция для плавной анимации
  const animateNumberChange = (start, end) => {
    const duration = 5000; // Длительность анимации в миллисекундах
    const frameRate = 60; // Частота кадров
    const frames = Math.round((duration / 1000) * frameRate); // Количество кадров
    let currentFrame = 0;

    const updateNumber = () => {
      currentFrame += 1;
      // Используем easing для замедления
      const progress = Math.pow(currentFrame / frames, 2.5);
      const currentNumber = Math.round(start + (end - start) * progress);

      setDisplayNumber(currentNumber);

      if (currentFrame < frames) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayNumber(end);
      }
    };

    requestAnimationFrame(updateNumber);
  };

  // Устанавливаем интервал для обновления каждые 15 секунд
  useEffect(() => {
    fetchLiveNumber(); // Начальное значение при монтировании

    const interval = setInterval(fetchLiveNumber, 5000);
    return () => clearInterval(interval); // Чистка интервала при размонтировании
  }, [fetchLiveNumber]);

  return (
    <div className="live" id="divlive">
      <h1 className="title">NUMBER</h1>
      <p className="number">{displayNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
      <div className="live-queue">{t('live')}</div>
    </div>
  );
}
