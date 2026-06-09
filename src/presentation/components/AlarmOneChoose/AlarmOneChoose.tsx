import React from 'react';
import './AlarmOneChoose.css';

interface AlarmOneChooseProps {
    message: string;
    buttonText: string;
    onClose: () => void;
}

export const AlarmOneChoose: React.FC<AlarmOneChooseProps> = ({ message, buttonText, onClose }) => {
    return (
        <div className="alarm-overlay">
            <div className="alarm-box">
                <p className="alarm-message">{message}</p>
                <button className="alarm-button" onClick={onClose}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};
