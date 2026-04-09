import io
import base64

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile


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


def png_to_base64(png_bytes: bytes) -> str:
    return base64.b64encode(png_bytes).decode("utf-8")
