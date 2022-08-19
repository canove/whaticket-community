import { Button } from "@material-ui/core";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

const LS_NAME = 'audioMessageRate';

export default function({url}) {
    const audioRef = useRef(null);
    const [audioRate, setAudioRate] = useState( parseFloat(localStorage.getItem(LS_NAME) || "1") );
    const [showButtonRate, setShowButtonRate] = useState(false);

    useEffect(() => {
        audioRef.current.playbackRate = audioRate;
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    useEffect(() => {
        audioRef.current.onplaying = () => {
            setShowButtonRate(true);
        };
        audioRef.current.onpause = () => {
            setShowButtonRate(false);
        };
        audioRef.current.onended = () => {
            setShowButtonRate(false);
        };
    }, []);

    const toogleRate = () => {
        let newRate = null;

        switch(audioRate) {
            case 0.5:
                newRate = 1;
                break;
            case 1:
                newRate = 1.5;
                break;
            case 1.5:
                newRate = 2;
                break;
            case 2:
                newRate = 0.5;
                break;
            default:
                newRate = 1;
                break;
        }
        
        setAudioRate(newRate);
    };

    return (
        <>
            <audio ref={audioRef} controls>
                <source src={url} type="audio/ogg"></source>
            </audio>
            {showButtonRate && <Button style={{marginLeft: "5px", marginTop: "-45px"}} onClick={toogleRate}>{audioRate}x</Button>}
        </>
    );
}