/* eslint-disable react/prop-types */
import coin from '../img/coin.svg';
import gift from '../img/gift.svg';
import { useUser } from '../context/userProvider';
import { useTranslation } from 'react-i18next';

export function Friends() {
  
  const {user} = useUser();
  const {t} = useTranslation();
  const INVITE_URL = "https://t.me/NumbersApps_Bot"

  const handleInviteFriend = () => {
    const inviteLink = `${INVITE_URL}?start=${user.refferalCode[0]}`
    const shareText = `Join me on this awesome Numbers App!`
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    window.Telegram.WebApp.openTelegramLink(fullUrl);
  }

  return (
    <div className="friends" id="divfriends">
      <p className="friends_p1">{t('invite')}</p>
      <p className="friends_p2">{t('invite_msg')}</p>
      
      <div className="friends_gift">
        <div className="friends_gift_row">
          <img src={gift} className="friends_gift_img" alt="Gift" />
          <div className="friends_gift_text">
            <p className="friends_gift_text_p">{t('invite')}</p>
            <p className="friends_gift_img_text_pImg">
              <img src={coin} alt="Coin" />
              {t('invite_promo')}
            </p>
          </div>
        </div>

        <p className="friends_gift_p">
          {t('friends_list')} (<span className="friends_gift_p_count">{Object.entries(user.refferals).length}</span>)
        </p>
  
        <div className="friends_gift_list">
          {Object.entries(user.refferals)
    .sort(([, a], [, b]) => b.rewards - a.rewards) // Sort by rewards in descending order
    // eslint-disable-next-line no-unused-vars
    .map(([userId, friend], index) => (
            <div className="fgl_item" key={index}>
              <div className="fgl_item_left">
              <p className="fgl_item_left_ref"><span>{index + 1}</span></p>
                <p className="fgl_item_left_name">{friend.name}</p>
              </div>
              <div className="fgl_item_right">
                <img src={coin} alt="Coin" />
                <p className="fgl_item_price">+{friend.rewards}$</p>
              </div>
            </div>
          ))}
        </div>
        <div className="friends_gift_inviteBtn" onClick={handleInviteFriend}>
          {t('invite').toUpperCase()}
        </div>
      </div>
    </div>
  );
}
