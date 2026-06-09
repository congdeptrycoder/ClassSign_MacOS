import React from 'react';
import './AlarmTwoChoose.css';

interface AlarmTwoChooseProps {
    message: string;
    button1Text: string;
    button2Text: string;
    onButton1Click: () => void;
    onButton2Click: () => void;
}

export const AlarmTwoChoose: React.FC<AlarmTwoChooseProps> = ({
    message,
    button1Text,
    button2Text,
    onButton1Click,
    onButton2Click,
}) => {
    return (
        <div className="alarm-overlay">
            <div className="alarm-box">
                <p className="alarm-message">{message}</p>
                <div className="alarm-buttons">
                    <button className="alarm-button-secondary" onClick={onButton1Click}>
                        {button1Text}
                    </button>
                    <button className="alarm-button-primary" onClick={onButton2Click}>
                        {button2Text}
                    </button>
                </div>
            </div>
        </div>
    );
};
