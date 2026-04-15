/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
const SuccessPopup = ({ message, onClose }) => {
    const {t}= useTranslation();
    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <p style={styles.msg}>{message}</p>
                <button className="popupBuy_frame_buy" onClick={onClose}>{t('close')}</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    popup: {
        width: '90%',
        backgroundColor: 'rgb(25, 78, 12)',
        padding: '20px',
        borderRadius: '5px',
        borderColor: '#FFD801',
        border: '2px solid',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    msg: {
        fontSize: '20px',
        textAlign: 'center',
        fontWeight: '600',
        margin: '10px 0 40px 0'
    }
};

export default SuccessPopup;
