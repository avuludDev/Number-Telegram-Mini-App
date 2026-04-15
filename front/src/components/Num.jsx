import { useCallback, useEffect, useRef, useState } from 'react';
import { BuyPopup } from './BuyPopup';
import arrow from '../img/arrow-4-right.svg'
import ellipse from '../img/ellipse.svg'
import checkmark from '../img/checkmark.svg'
import { axiosInstance } from '../libs/axios';
import { useUser } from '../context/userProvider';
import ProgressRing from './ProgressRing';
import { useTranslation } from 'react-i18next';

export function Num() {
  const [isBuyPopupVisible, setBuyPopupVisible] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const [totals, setTotals] = useState({total: 0, open: 0, closed: 0})
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false); 
  const { user } = useUser();
  const {t} = useTranslation();

  const fetchNumbers = useCallback(async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true; // Lock fetch
    try {
      const response = await axiosInstance.get(`/numbers/${user.tgId}/${offset}`);
      setTotals(response.data.total);
      setNumbers((prevNumbers) => [...prevNumbers, ...response.data.numbers]);
      setOffset((prevOffset) => prevOffset + response.data.numbers.length);
      if (response.data.numbers.length < 100) {
        setHasMore(false); // No more numbers to fetch
      }
    } catch (error) {
      console.error("Error fetching numbers:", error);
    } finally {
      isFetching.current = false; // Unlock fetch
    }
  }, [user, offset, hasMore]);

  
  const handleScroll = useCallback(
    (e) => {
      const container = e.target;
      if (
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 200 // Adjust threshold as needed
      ) {
        fetchNumbers();
      }
    },
    [fetchNumbers]
  );

  useEffect(() => {
    fetchNumbers(); // Fetch the first batch of numbers when the component mounts
  }, []); // Dependency array is empty to ensure it runs only once



  const handleBuyClick = () => setBuyPopupVisible(true);
  const closePopup = () => setBuyPopupVisible(false);

  return (
    <div className="numbers" id="divnum">
      <h1 className="numbers_title">{t('your_numbers')}</h1>

      <div className="numbersList"
       onScroll={handleScroll}>
        <div className="stat">
          <ProgressRing numbers={totals} />
        </div>

        {numbers.map((num) => (
          <div
            key={num._id}
            className="numbersList_item"
            id={num.closedBy === null ? "ExpectNum" : "PaidOut"}
          >
            <div className="numbersList_item_mark">
              <img src={num.closedBy === null ? ellipse : checkmark} alt="status icon" />
              <div className="stikDown"></div>
            </div>
            <p className="numbersList_item_num">Num {num.number}</p>
            <div className="numbersList_item_arrow">
              <div className="numbersList_item_arrow_row"></div>
              <img src={arrow} alt="arrow icon" />
            </div>
            <p className={`numbersList_item_status ${num.closedBy === null ? "statusNumRed" : ""}`}>
              {num.closedBy === null
                ? `${t('expect')} ${num.number * 2 + 1}`
                : `${t('payout')} 1,5$`}
            </p>
          </div>
        ))}
      </div>

      <div className="numbers_button" onClick={handleBuyClick}>
      {t('buy').toUpperCase()}$
      </div>

      <BuyPopup isVisible={isBuyPopupVisible} onClose={closePopup} />
    </div>
  );
}


