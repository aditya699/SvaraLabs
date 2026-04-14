import io

import numpy as np
import torch
from scipy.io import wavfile
from torchaudio.transforms import MelSpectrogram, AmplitudeToDB, Resample

TARGET_SR = 16000
TARGET_LENGTH = 16000  # 1 second at 16 kHz

mel_spectrogram = MelSpectrogram(
    sample_rate=TARGET_SR, n_fft=400, hop_length=160, n_mels=64
)
amplitude_to_db = AmplitudeToDB()


def audio_to_mel_spectrogram(audio_bytes: bytes) -> torch.Tensor:
    buf = io.BytesIO(audio_bytes)
    sr, data = wavfile.read(buf)

    # normalize to float32 [-1, 1]
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    elif data.dtype != np.float32:
        data = data.astype(np.float32)

    # stereo to mono
    if data.ndim > 1:
        data = data.mean(axis=1)

    # to tensor [1, num_samples]
    waveform = torch.from_numpy(data).unsqueeze(0)

    # resample to 16 kHz
    if sr != TARGET_SR:
        resampler = Resample(orig_freq=sr, new_freq=TARGET_SR)
        waveform = resampler(waveform)

    # pad or truncate to exactly 1 second
    if waveform.shape[1] < TARGET_LENGTH:
        waveform = torch.nn.functional.pad(waveform, (0, TARGET_LENGTH - waveform.shape[1]))
    else:
        waveform = waveform[:, :TARGET_LENGTH]

    # mel spectrogram + dB  →  shape [1, 64, 101]
    mel = mel_spectrogram(waveform)
    mel = amplitude_to_db(mel)
    return mel
