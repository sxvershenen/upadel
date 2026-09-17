class TransitionAudio {
  private context: AudioContext | null = null
  private buffers = new Map<string, AudioBuffer>()
  enabled = true
  volume = 0.42

  private getContext(resume = true) {
    if (!this.context) {
      const AudioContextConstructor = window.AudioContext
        || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextConstructor) return null
      this.context = new AudioContextConstructor()
    }
    if (resume && this.context.state === 'suspended') void this.context.resume().catch(() => {})
    return this.context
  }

  private getNoiseBuffer(context: AudioContext, duration: number) {
    const length = Math.max(1, Math.floor(context.sampleRate * duration))
    const key = `${context.sampleRate}:${length}`
    const cached = this.buffers.get(key)
    if (cached) return cached

    const buffer = context.createBuffer(1, length, context.sampleRate)
    const output = buffer.getChannelData(0)
    let b0 = 0
    let b1 = 0
    let b2 = 0
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      output[index] = (b0 + b1 + b2) * 0.4
    }

    this.buffers.set(key, buffer)
    return buffer
  }

  playWhoosh(duration = 0.95) {
    if (!this.enabled) return
    try {
      const context = this.getContext()
      if (!context) return
      const now = context.currentTime
      const buffer = this.getNoiseBuffer(context, duration)

      const source = context.createBufferSource()
      source.buffer = buffer
      const filter = context.createBiquadFilter()
      filter.type = 'bandpass'
      filter.Q.setValueAtTime(2.2, now)
      const peak = now + duration * 0.45
      filter.frequency.setValueAtTime(320, now)
      filter.frequency.exponentialRampToValueAtTime(2200, peak)
      filter.frequency.exponentialRampToValueAtTime(450, now + duration)

      const gain = context.createGain()
      gain.gain.setValueAtTime(0.008, now)
      gain.gain.exponentialRampToValueAtTime(this.volume, peak)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(context.destination)
      source.start(now)
      source.stop(now + duration)
    } catch {
      // Browser autoplay or Web Audio restrictions should never block navigation.
    }
  }
}

export const transitionAudio = new TransitionAudio()
