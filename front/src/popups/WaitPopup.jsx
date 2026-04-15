import { CircularProgress } from "@mui/material";
/* eslint-disable react/prop-types */
const WaitPopup = ({ message }) => {
    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
            <CircularProgress style={styles.spinner} /> {/* Loading spinner */}
                <p style={styles.msg}>{message}</p>
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
        backgroundColor: 'rgba(4, 30, 4, 1)', // Greenish background for a "waiting" state
        padding: '20px',
        textAlign: 'center',
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
    },
    spinner: {
        marginBottom: '20px', // Adds space between spinner and message
        color: 'white'
    },
    popup2:{
        border: '324'
    }
};

export default WaitPopup;
