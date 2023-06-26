import { createState } from './lib/createState.js'

let audioContext
let audioBuffers = []
let audioSource
let currentAudioBuffer
let startTime = 0
let elapsedTime = 0
let isPaused = false

const audioFiles = ['new-wave-kit.ogg', 'synth-organ.ogg']

async function preloadAudio() {
  audioContext = new AudioContext()
  audioBuffers = await Promise.all(
    audioFiles.map(async audioFile => {
      const response = await fetch(`/audio/${audioFile}`)
      const arrayBuffer = await response.arrayBuffer()
      return await audioContext.decodeAudioData(arrayBuffer)
    }),
  )
}

function playAudio() {
  if (isPaused) {
    startTime = audioContext.currentTime - elapsedTime
    isPaused = false
  } else {
    stopAudio()

    if (!currentAudioBuffer) {
      return
    }

    startTime = audioContext.currentTime
    elapsedTime = 0

    audioSource = audioContext.createBufferSource()
    audioSource.buffer = currentAudioBuffer
    audioSource.connect(audioContext.destination)
  }

  audioSource.start(0, elapsedTime)
}

function stopAudio() {
  if (audioSource) {
    elapsedTime = audioContext.currentTime - startTime
    audioSource.stop()
    audioSource = null
    isPaused = true
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const currentAudioIndex = createState(0)

  const playButton = document.querySelector('.play-button')
  const pauseButton = document.querySelector('.pause-button')
  const nextButton = document.querySelector('.next-button')
  const prevButton = document.querySelector('.prev-button')
  const currentFilename = document.querySelector('.current-filename')

  playButton.addEventListener('click', () => {
    playAudio()
  })

  pauseButton.addEventListener('click', () => {
    stopAudio()
  })

  nextButton.addEventListener('click', () => {
    let newIndex = currentAudioIndex.get() + 1

    if (newIndex >= audioBuffers.length) {
      newIndex = 0
    }

    currentAudioIndex.set(newIndex)
  })

  prevButton.addEventListener('click', () => {
    let newIndex = currentAudioIndex.get() - 1

    if (newIndex < 0) {
      newIndex = audioBuffers.length - 1
    }

    currentAudioIndex.set(newIndex)
  })

  currentAudioIndex.subscribe((index, prevIndex) => {
    if (prevIndex !== index) {
      currentAudioBuffer = audioBuffers[index]
      currentFilename.textContent = audioFiles[index]
    }
  })

  preloadAudio().then(() => {
    currentAudioBuffer = audioBuffers[currentAudioIndex.get()]
  })
})
