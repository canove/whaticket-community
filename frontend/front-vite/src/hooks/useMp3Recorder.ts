import { useState } from "react";

import * as lame from "@breezystack/lamejs";

type WavHeader = {
  channels: number;
  sampleRate: number;
  dataLen: number;
  dataOffset: number;
};

export const useMp3Recorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(
    null as MediaRecorder | null
  );
  const [audioChunks, setAudioChunks] = useState([] as Blob[]);

  const [blob, setBlob] = useState(null as Blob | null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setMediaRecorder(new MediaRecorder(stream));
      if (mediaRecorder === null) return;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        setAudioChunks((chunks) => [...chunks, event.data]);
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const mp3Blob = convertToMP3(arrayBuffer);
          setBlob(mp3Blob);
        }
      };

      mediaRecorder.start();
      console.log("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  function stopRecording(): void {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log("Recording stopped.");
    } else {
      console.warn("No recording is in progress.");
    }
  }

  function convertToMP3(wavBuffer: ArrayBuffer): Blob {
    //@ts-ignore
    const wavHeader = lame.WavHeader.readHeader(
      new DataView(wavBuffer)
    ) as WavHeader;
    const samples = new Int16Array(
      wavBuffer,
      wavHeader.dataOffset,
      wavHeader.dataLen / 2
    );

    const mp3Encoder = new lame.Mp3Encoder(
      wavHeader.channels,
      wavHeader.sampleRate,
      128
    );
    const mp3Data: Uint8Array[] = [];

    let mp3Buffer = mp3Encoder.encodeBuffer(samples);
    if (mp3Buffer.length > 0) mp3Data.push(mp3Buffer);

    mp3Buffer = mp3Encoder.flush();
    if (mp3Buffer.length > 0) mp3Data.push(mp3Buffer);

    return new Blob(mp3Data, { type: "audio/mp3" });
  }

  return { startRecording, stopRecording, blob };
};
