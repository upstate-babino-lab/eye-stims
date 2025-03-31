import numpy as np
import matplotlib.pyplot as plt

def plot_sine_vs_sine_squared(length):
    """Plots a sine wave and its fourth power."""

    x = np.linspace(0, np.pi, length)  # Generate x values from 0 to pi
    sine_wave = np.sin(x)
    sine_squared = np.sin(x)**4

    plt.figure(figsize=(10, 6))  # Adjust figure size for better viewing
    plt.plot(x, sine_wave, label='sin(x)')
    plt.plot(x, sine_squared, label='sin(x)^4')

    plt.xlabel('x (radians)')
    plt.ylabel('Amplitude')
    plt.legend()
    plt.grid(True)
    plt.show()

# Example usage:
plot_sine_vs_sine_squared(100) # creates a plot of 100 points.
