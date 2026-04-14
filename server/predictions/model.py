import torch
import torch.nn as nn

LABELS = [
    "backward", "bed", "bird", "cat", "dog", "down", "eight", "five",
    "follow", "forward", "four", "go", "happy", "house", "learn", "left",
    "marvin", "nine", "no", "off", "on", "one", "right", "seven", "sheila",
    "six", "stop", "three", "tree", "two", "up", "visual", "wow", "yes", "zero",
]


class AudioCNN(nn.Module):
    def __init__(self, num_classes=35):
        super(AudioCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.fc = nn.Linear(64 * 16 * 25, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


_model: AudioCNN | None = None


def load_model(path: str):
    global _model
    _model = AudioCNN(num_classes=35)
    _model.load_state_dict(torch.load(path, map_location="cpu", weights_only=True))
    _model.eval()


def get_model() -> AudioCNN:
    return _model
