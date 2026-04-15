import { Link, useLocation } from 'react-router-dom';
import live from '../img/nav/live.svg';
import num from '../img/nav/num.svg';
import friends from '../img/nav/friends.svg';
import wallet from '../img/nav/wallet.svg';
import activelive from '../img/nav/activelive.svg';
import activenum from '../img/nav/activenum.svg';
import activefriends from '../img/nav/activefriends.svg';
import activewallet from '../img/nav/activewallet.svg';

export default function Nav() {
    const location = useLocation(); // Hook to get current path

    // Function to get icon path based on current route
    const getIcon = (type) => {
        switch (type) {
            case 'live':
                return location.pathname === '/live' ? activelive : live;
            case 'num':
                return location.pathname === '/num' ? activenum : num;
            case 'friends':
                return location.pathname === '/friends' ? activefriends : friends;
            case 'wallet':
                return location.pathname === '/wallet' ? activewallet : wallet;
            default:
                return live;
        }
    };

    return (
        <div className="footer">
            <Link to="/live" className="icon-button" style={{ opacity: location.pathname === '/live' ? 1 : 0.5 }}>
                <img src={getIcon('live')} alt="Live" />
            </Link>
            <Link to="/num" className="icon-button" style={{ opacity: location.pathname === '/num' ? 1 : 0.5 }}>
                <img src={getIcon('num')} alt="Num" />
            </Link>
            <Link to="/friends" className="icon-button" style={{ opacity: location.pathname === '/friends' ? 1 : 0.5 }}>
                <img src={getIcon('friends')} alt="Friends" />
            </Link>
            <Link to="/wallet" className="icon-button" style={{ opacity: location.pathname === '/wallet' ? 1 : 0.5 }}>
                <img src={getIcon('wallet')} alt="Wallet" />
            </Link>
        </div>
    );
}
