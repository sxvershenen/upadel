let audioModule: Promise<typeof import('./transitionAudio')> | null = null

function loadTransitionAudio() {
  return audioModule ??= import('./transitionAudio')
}

export function playTransitionWhoosh(duration: number) {
  void loadTransitionAudio().then(({ transitionAudio }) => {
    transitionAudio.playWhoosh(duration)
  }).catch(() => {
    // Audio is optional and must never affect navigation.
  })
}
