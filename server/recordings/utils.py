import io
import base64

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile
from scipy.signal import stft


def decode_audio(audio_bytes: bytes) -> tuple[int, np.ndarray]:
    buf = io.BytesIO(audio_bytes)
    sample_rate, data = wavfile.read(buf)
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float64)
    if data.max() != data.min():
        data = data / max(abs(data.max()), abs(data.min()))
    return sample_rate, data


def generate_waveform_png(data: np.ndarray, sample_rate: int) -> bytes:
    duration = len(data) / sample_rate
    time_axis = np.linspace(0, duration, num=len(data))

    fig, ax = plt.subplots(figsize=(10, 3), dpi=100)
    fig.patch.set_facecolor("#FAF7F2")
    ax.set_facecolor("#FAF7F2")

    ax.plot(time_axis, data, color="#C4956A", linewidth=0.5, alpha=0.85)
    ax.fill_between(time_axis, data, alpha=0.15, color="#C4956A")

    ax.set_xlabel("Time (s)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylabel("Amplitude", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_xlim(0, duration)
    ax.set_ylim(-1.05, 1.05)
    ax.tick_params(colors="#8B7355", labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#E8E0D4")
    ax.grid(True, alpha=0.2, color="#8B7355")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def generate_spectrum_png(data: np.ndarray, sample_rate: int) -> bytes:
    n = len(data)
    fft_result = np.fft.fft(data)
    freqs = np.fft.fftfreq(n, d=1.0 / sample_rate)

    positive = freqs[:n // 2]
    magnitudes = np.abs(fft_result[:n // 2])

    mask = positive <= 8000
    freqs_plot = positive[mask]
    mags_plot = magnitudes[mask]

    if mags_plot.max() > 0:
        mags_plot = mags_plot / mags_plot.max()

    fig, ax = plt.subplots(figsize=(10, 3), dpi=100)
    fig.patch.set_facecolor("#FAF7F2")
    ax.set_facecolor("#FAF7F2")

    ax.plot(freqs_plot, mags_plot, color="#C4956A", linewidth=0.5, alpha=0.85)
    ax.fill_between(freqs_plot, mags_plot, alpha=0.15, color="#C4956A")

    ax.set_xlabel("Frequency (Hz)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylabel("Amplitude", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_xlim(0, 8000)
    ax.set_ylim(0, 1.05)
    ax.tick_params(colors="#8B7355", labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#E8E0D4")
    ax.grid(True, alpha=0.2, color="#8B7355")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def generate_spectrogram_png(data: np.ndarray, sample_rate: int) -> bytes:
    f, t, Zxx = stft(data, sample_rate, nperseg=1024)

    mask = f <= 8000
    f = f[mask]
    Zxx = Zxx[mask, :]

    magnitude = np.abs(Zxx)
    magnitude = np.where(magnitude > 0, magnitude, 1e-10)
    magnitude_db = 10 * np.log10(magnitude)

    fig, ax = plt.subplots(figsize=(10, 4), dpi=100)
    fig.patch.set_facecolor("#FAF7F2")
    ax.set_facecolor("#FAF7F2")

    mesh = ax.pcolormesh(t, f, magnitude_db, shading="gouraud", cmap="inferno")
    cbar = fig.colorbar(mesh, ax=ax, pad=0.02)
    cbar.set_label("Intensity (dB)", fontsize=9, color="#8B7355", fontfamily="sans-serif")
    cbar.ax.tick_params(colors="#8B7355", labelsize=7)

    ax.set_xlabel("Time (s)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylabel("Frequency (Hz)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylim(0, 8000)
    ax.tick_params(colors="#8B7355", labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#E8E0D4")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def _hz_to_mel(hz: np.ndarray | float) -> np.ndarray | float:
    return 2595.0 * np.log10(1.0 + hz / 700.0)


def _mel_to_hz(mel: np.ndarray | float) -> np.ndarray | float:
    return 700.0 * (10.0 ** (mel / 2595.0) - 1.0)


def _mel_filterbank(sample_rate: int, n_fft: int, n_mels: int = 128, fmin: float = 0.0, fmax: float = 8000.0) -> np.ndarray:
    mel_min = _hz_to_mel(fmin)
    mel_max = _hz_to_mel(fmax)
    mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
    hz_points = _mel_to_hz(mel_points)

    bin_points = np.floor((n_fft + 1) * hz_points / sample_rate).astype(int)

    filterbank = np.zeros((n_mels, n_fft // 2 + 1))
    for i in range(n_mels):
        left, center, right = bin_points[i], bin_points[i + 1], bin_points[i + 2]
        for j in range(left, center):
            if center != left:
                filterbank[i, j] = (j - left) / (center - left)
        for j in range(center, right):
            if right != center:
                filterbank[i, j] = (right - j) / (right - center)
    return filterbank


def generate_mel_spectrogram_png(data: np.ndarray, sample_rate: int) -> bytes:
    nperseg = 1024
    f, t, Zxx = stft(data, sample_rate, nperseg=nperseg)

    power = np.abs(Zxx) ** 2

    fb = _mel_filterbank(sample_rate, nperseg, n_mels=128, fmin=0.0, fmax=8000.0)
    mel_spec = fb @ power[:nperseg // 2 + 1, :]

    mel_spec = np.where(mel_spec > 0, mel_spec, 1e-10)
    mel_spec_db = 10.0 * np.log10(mel_spec)

    mel_freqs = _mel_to_hz(np.linspace(_hz_to_mel(0), _hz_to_mel(8000), 128))

    fig, ax = plt.subplots(figsize=(10, 4), dpi=100)
    fig.patch.set_facecolor("#FAF7F2")
    ax.set_facecolor("#FAF7F2")

    mesh = ax.pcolormesh(t, np.arange(128), mel_spec_db, shading="gouraud", cmap="inferno")
    cbar = fig.colorbar(mesh, ax=ax, pad=0.02)
    cbar.set_label("Intensity (dB)", fontsize=9, color="#8B7355", fontfamily="sans-serif")
    cbar.ax.tick_params(colors="#8B7355", labelsize=7)

    tick_hz = [0, 250, 500, 1000, 2000, 4000, 8000]
    tick_positions = []
    for hz in tick_hz:
        mel_val = _hz_to_mel(hz)
        pos = 127 * (mel_val - _hz_to_mel(0)) / (_hz_to_mel(8000) - _hz_to_mel(0))
        tick_positions.append(pos)
    ax.set_yticks(tick_positions)
    ax.set_yticklabels([str(h) for h in tick_hz])

    ax.set_xlabel("Time (s)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylabel("Frequency (Hz)", fontsize=10, color="#8B7355", fontfamily="sans-serif")
    ax.set_ylim(0, 127)
    ax.tick_params(colors="#8B7355", labelsize=8)
    for spine in ax.spines.values():
        spine.set_color("#E8E0D4")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def png_to_base64(png_bytes: bytes) -> str:
    return base64.b64encode(png_bytes).decode("utf-8")


def downsample_waveform(data: np.ndarray, sample_rate: int, max_points: int = 1500) -> list[dict]:
    step = max(1, len(data) // max_points)
    indices = np.arange(0, len(data), step)
    times = indices / sample_rate
    amplitudes = data[indices]
    return [{"t": round(float(t), 4), "a": round(float(a), 4)} for t, a in zip(times, amplitudes)]


def downsample_spectrum(data: np.ndarray, sample_rate: int, max_points: int = 1500) -> list[dict]:
    n = len(data)
    fft_result = np.fft.fft(data)
    freqs = np.fft.fftfreq(n, d=1.0 / sample_rate)

    positive = freqs[:n // 2]
    magnitudes = np.abs(fft_result[:n // 2])

    mask = positive <= 8000
    freqs_masked = positive[mask]
    mags_masked = magnitudes[mask]

    if mags_masked.max() > 0:
        mags_masked = mags_masked / mags_masked.max()

    step = max(1, len(freqs_masked) // max_points)
    indices = np.arange(0, len(freqs_masked), step)
    return [{"f": round(float(freqs_masked[i]), 1), "a": round(float(mags_masked[i]), 4)} for i in indices]
