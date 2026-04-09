import sounddevice as sd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # no display needed — saves to file
import matplotlib.pyplot as plt

SAMPLE_RATE = 16000
DURATION    = 3

print("Recording... say something!")
audio = sd.rec(int(DURATION * SAMPLE_RATE),
               samplerate=SAMPLE_RATE,
               channels=1,
               dtype='float32')
sd.wait()
print("Done.")

audio = audio.flatten()
time  = np.linspace(0, DURATION, len(audio))

plt.figure(figsize=(10, 3))
plt.plot(time, audio, linewidth=0.5)
plt.title("Your voice — raw waveform")
plt.xlabel("Time (seconds)")
plt.ylabel("Amplitude")
plt.tight_layout()
plt.savefig("waveform.png", dpi=150)
print("Saved to waveform.png")

print(f"Total samples : {len(audio)}")
print(f"Min amplitude : {audio.min():.4f}")
print(f"Max amplitude : {audio.max():.4f}")
print(f"First 10 values:\n{audio[:10]}")