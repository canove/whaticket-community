import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserAgent, Registerer, Inviter, SessionState } from "sip.js";
import dtmf_0 from "../../assets/dtmf_0.mp3";
import dtmf_1 from "../../assets/dtmf_1.mp3";
import dtmf_2 from "../../assets/dtmf_2.mp3";
import dtmf_3 from "../../assets/dtmf_3.mp3";
import dtmf_4 from "../../assets/dtmf_4.mp3";
import dtmf_5 from "../../assets/dtmf_5.mp3";
import dtmf_6 from "../../assets/dtmf_6.mp3";
import dtmf_7 from "../../assets/dtmf_7.mp3";
import dtmf_8 from "../../assets/dtmf_8.mp3";
import dtmf_9 from "../../assets/dtmf_9.mp3";
import sound from "../../assets/dtmf_0.mp3";
import sound_loud from "../../assets/dtmf_0.mp3";
import calling from "../../assets/calling.mp3";
import "./AsteriskWebphone.css";

const AsteriskWebphone = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallingInProgress, setIsCallingInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const userAgentRef = useRef(null);
  const registererRef = useRef(null);
  const sessionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringToneRef = useRef(null);
  const callingToneRef = useRef(null);
  const dtmfRefs = useRef({});
  const timerRef = useRef(null);

  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  const dtmfSounds = {
    1: dtmf_1,
    2: dtmf_2,
    3: dtmf_3,
    4: dtmf_4,
    5: dtmf_5,
    6: dtmf_6,
    7: dtmf_7,
    8: dtmf_8,
    9: dtmf_9,
    0: dtmf_0,
    "*": sound,
    "#": sound_loud,
  };

  const playRingTone = useCallback(() => {
    if (ringToneRef.current) {
      try {
        ringToneRef.current.currentTime = 0;
        ringToneRef.current.volume = 1.0;
        ringToneRef.current.loop = true;
        ringToneRef.current.play().catch((error) => {
          console.error("Erro ao tocar som de toque:", error);
        });
      } catch (error) {
        console.error("Erro ao tocar som de toque:", error);
      }
    }
  }, []);

  const stopRingTone = useCallback(() => {
    if (ringToneRef.current) {
      try {
        ringToneRef.current.pause();
        ringToneRef.current.currentTime = 0;
      } catch (error) {
        console.error("Erro ao parar som de toque:", error);
      }
    }
  }, []);

  const stopCallTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCallTimer = useCallback(() => {
    const start = Date.now();
    setStartTime(start);
    timerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - start) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setCallDuration(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);
  }, []);

  const setupSession = useCallback(
    (session) => {
      session.stateChange.addListener((state) => {
        if (state === SessionState.Established) {
          const pc = session.sessionDescriptionHandler.peerConnection;
          pc.getReceivers().forEach((receiver) => {
            if (receiver.track && receiver.track.kind === "audio") {
              const stream = new MediaStream([receiver.track]);
              remoteAudioRef.current.srcObject = stream;
              remoteAudioRef.current.play();
            }
          });
          setCallStatus("Em chamada");
          setIsCallingInProgress(false);
          stopRingTone();
          startCallTimer();
        }
        if (state === SessionState.Terminated) {
          setIsCalling(false);
          setCallStatus("Chamada finalizada");
          setIsCallingInProgress(false);
          stopRingTone();
          stopCallTimer();
          setCallDuration(null);
          setStartTime(null);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
          }
        }
      });
    },
    [stopRingTone, startCallTimer, stopCallTimer]
  );

  const startSip = useCallback(async () => {
    const config = {
      username: "1000",
      password: "senha",
      server: "astersip.astertelecom.com.br",
      port: "8089",
      transport: "wss",
    };

    userAgentRef.current = new UserAgent({
      uri: UserAgent.makeURI(`sip:${config.username}@${config.server}`),
      transportOptions: {
        server: `wss://${config.server}:${config.port}/ws`,
      },
      authorizationUsername: config.username,
      authorizationPassword: config.password,
      logLevel: "error",
    });

    userAgentRef.current.delegate = {
      onInvite: (invitation) => {
        sessionRef.current = invitation;
        setupSession(invitation);
        setIsCalling(true);
        setCallStatus("Chamada recebida");
        setPhoneNumber(invitation.remoteIdentity.uri.user);
        playRingTone();
      },
    };

    await userAgentRef.current.start();
    registererRef.current = new Registerer(userAgentRef.current);
    await registererRef.current.register();
    setIsConnected(true);
  }, [playRingTone, setupSession]);

  const makeCall = async () => {
    if (!phoneNumber || isCallingInProgress) return;

    try {
      setIsCallingInProgress(true);
      const config = {
        username: "1000",
        server: "astersip.astertelecom.com.br",
      };
      const target = UserAgent.makeURI(`sip:${phoneNumber}@${config.server}`);
      const inviter = new Inviter(userAgentRef.current, target, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });
      sessionRef.current = inviter;
      setupSession(inviter);
      await inviter.invite();
      setIsCalling(true);
      setCallStatus("Chamando...");
    } catch (error) {
      console.error("Erro ao iniciar chamada:", error);
    } finally {
      setIsCallingInProgress(false);
    }
  };

  const acceptCall = async () => {
    if (!sessionRef.current) return;

    try {
      setIsCallingInProgress(true);
      await sessionRef.current.accept();
      setCallStatus("Conectado");
    } catch (error) {
      console.error("Erro ao aceitar chamada:", error);
    } finally {
      setIsCallingInProgress(false);
    }
  };

  const hangupCall = async () => {
    if (!sessionRef.current) return;

    try {
      if (sessionRef.current.state === SessionState.Established) {
        await sessionRef.current.bye();
      } else if (sessionRef.current.state === SessionState.Initial) {
        await sessionRef.current.reject();
      } else if (sessionRef.current.state === SessionState.Establishing) {
        if (sessionRef.current instanceof Inviter) {
          await sessionRef.current.cancel();
        } else {
          await sessionRef.current.bye();
        }
      } else {
        await sessionRef.current.bye();
      }
    } catch (error) {
      console.error("Erro ao encerrar chamada:", error);
    } finally {
      setIsCalling(false);
      setCallStatus("Chamada finalizada");
      setIsCallingInProgress(false);
      stopRingTone();
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
      sessionRef.current = null;
    }
  };

  const playDialTone = (number) => {
    let audioRef;
    if (number === "*") {
      audioRef = "dtmf_star";
    } else if (number === "#") {
      audioRef = "dtmf_hash";
    } else {
      audioRef = `dtmf_${number}`;
    }
    if (dtmfRefs.current[audioRef]) {
      try {
        dtmfRefs.current[audioRef].currentTime = 0;
        dtmfRefs.current[audioRef].volume = 1.0;
        dtmfRefs.current[audioRef].play().catch((error) => {
          console.error(`Erro ao tocar som DTMF ${number}:`, error);
        });
      } catch (error) {
        console.error(`Erro ao tocar som DTMF ${number}:`, error);
      }
    }
  };

  const appendNumber = (number) => {
    setPhoneNumber((prev) => prev + number);
    playDialTone(number);
  };

  useEffect(() => {
    if (isOpen) {
      startSip();
    }

    return () => {
      if (userAgentRef.current) {
        try {
          userAgentRef.current.stop();
        } catch (error) {
          console.error("Erro ao parar UserAgent:", error);
        }
      }

      stopRingTone();
      stopCallTimer();

      if (sessionRef.current) {
        try {
          if (sessionRef.current.terminate) {
            sessionRef.current.terminate();
          }
          sessionRef.current = null;
        } catch (error) {
          console.error("Erro ao terminar sessão:", error);
        }
      }

      if (registererRef.current) {
        try {
          registererRef.current.stateChange.removeAllListeners();
          registererRef.current = null;
        } catch (error) {
          console.error("Erro ao limpar registrador:", error);
        }
      }

      setIsConnected(false);
      setIsCalling(false);
      setCallStatus("");
    };
  }, [isOpen, startSip, stopRingTone, stopCallTimer]);

  if (!isOpen) return null;

  return (
    <div className="asterisk-webphone-modal">
      <div className="asterisk-webphone">
        <button className="close-webphone-btn" onClick={onClose} title="Fechar">
          ×
        </button>
        {isConnected ? (
          <div className="webphone-container">
            <div className="status-indicator">
              <span className="text-positive">Conectado</span>
            </div>

            <div className="phone-input">
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="text"
                placeholder="Digite o número"
                className="number-input"
                disabled={isCalling && callStatus === "Chamada recebida"}
              />
            </div>

            <div className="keypad">
              {keypadRows.map((row, rowIndex) => (
                <div className="keypad-row" key={rowIndex}>
                  {row.map((number) => (
                    <button
                      key={number}
                      className="keypad-button"
                      onClick={() => appendNumber(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              ))}
              <div className="keypad-row">
                <button
                  className="keypad-button"
                  onClick={() => appendNumber("*")}
                >
                  *
                </button>
                <button
                  className="keypad-button"
                  onClick={() => appendNumber("0")}
                >
                  0
                </button>
                <button
                  className="keypad-button"
                  onClick={() => appendNumber("#")}
                >
                  #
                </button>
              </div>
            </div>

            <div className="call-controls">
              {isCalling && callStatus === "Chamada recebida" ? (
                <>
                  <button
                    className={`call-button ${
                      isCallingInProgress ? "disabled" : ""
                    }`}
                    onClick={acceptCall}
                    disabled={isCallingInProgress}
                  >
                    Atender
                  </button>
                  <button
                    className={`hangup-button ${
                      isCallingInProgress ? "disabled" : ""
                    }`}
                    onClick={hangupCall}
                    disabled={isCallingInProgress}
                  >
                    Recusar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`call-button ${
                      !isConnected ||
                      isCalling ||
                      !phoneNumber ||
                      isCallingInProgress
                        ? "disabled"
                        : ""
                    }`}
                    onClick={makeCall}
                    disabled={
                      !isConnected ||
                      isCalling ||
                      !phoneNumber ||
                      isCallingInProgress
                    }
                  >
                    Ligar
                  </button>
                  <button
                    className={`hangup-button ${!isCalling ? "disabled" : ""}`}
                    onClick={hangupCall}
                    disabled={!isCalling}
                  >
                    Desligar
                  </button>
                </>
              )}
            </div>

            {isCalling && (
              <div className="call-info">
                <div className="call-status">{callStatus}</div>
                {callDuration && (
                  <div className="call-duration">{callDuration}</div>
                )}
              </div>
            )}

            <audio ref={remoteAudioRef} autoPlay />
            <audio ref={ringToneRef} src={calling} preload="auto" />
            <audio ref={callingToneRef} src={calling} preload="auto" />

            {Object.entries(dtmfSounds).map(([key, src]) => (
              <audio
                key={key}
                ref={(el) => (dtmfRefs.current[`dtmf_${key}`] = el)}
                src={src}
                preload="auto"
              />
            ))}
          </div>
        ) : (
          <div className="disconnected-message">
            <span>Desconectado</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsteriskWebphone;
