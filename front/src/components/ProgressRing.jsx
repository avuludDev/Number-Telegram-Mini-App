/* eslint-disable react/prop-types */

import { useTranslation } from "react-i18next";

export default function ProgressRing({ numbers }) {
  const total = numbers.total;
  const expectCount = numbers.open;
  const paidOutCount = numbers.closed;
  const {t} = useTranslation();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Вычисляем проценты для "Expect" и "Paid out"
  const expectPercent = (expectCount / total) * 100;
  const paidOutPercent = (paidOutCount / total) * 100;

  // Вычисляем смещения для кругов
  const expectOffset = circumference - (expectPercent / 100) * circumference;
  const paidOutOffset = circumference - (paidOutPercent / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg className="progress-ring__svg" width="120" height="120">
        {/* Круг для Paid out */}
        <circle
          className="progress-ring__circle--orange"
          stroke="#FF7B01"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: expectOffset,
            transform: "rotate(-90deg) scale(1, -1)", // Начинаем сверху
            transformOrigin: "center",
          }}
        />
        {/* Круг для Expect */}
        <circle
          className="progress-ring__circle"
          stroke="#33BA81"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: paidOutOffset,
            transform: "rotate(-90deg)", // Начинаем сверху
            transformOrigin: "center",
          }}
        />
      </svg>
      <div className="stat_infoText">
        <p>
        {t('total')} - <span>{total}</span>
        </p>
        <p>
        {t('expect')} - <span>{expectCount}</span>
        </p>
        <p>
        {t('payout')} - <span>{paidOutCount}</span>
        </p>
      </div>
    </div>
  );
}
