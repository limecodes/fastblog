import { createState } from './lib/createState.js'

let audioContext
let audioBuffers = []
let audioSource
let currentAudioBuffer
let startTime = 0
let startTimestamp = 0
let elapsedTime = 0
let isPaused = false

const audioFiles = ['new-wave-kit.ogg', 'synth-organ.ogg']

document.addEventListener('DOMContentLoaded', () => {
  const currentAudioIndex = createState(0)

  const playButton = document.querySelector('.play-button')
  const pauseButton = document.querySelector('.pause-button')
  const nextButton = document.querySelector('.next-button')
  const prevButton = document.querySelector('.prev-button')
  const currentFilename = document.querySelector('.current-filename')
  const progressElement = document.getElementById('progress')

  function playAudio() {
    stopAudio()
    if (isPaused) {
      // if audioSource is null, we need to create a new one
      if (!audioSource) {
        audioSource = audioContext.createBufferSource()
        audioSource.buffer = currentAudioBuffer
        audioSource.connect(audioContext.destination)
      }
      // calculate the start time and mark audio as not paused
      startTime = audioContext.currentTime - elapsedTime
      isPaused = false
      audioSource.start(0, elapsedTime)
      requestAnimationFrame(updateProgress) // Start updating progress
    } else {
      if (!currentAudioBuffer) {
        return
      }

      // reset start time and elapsed time
      startTime = audioContext.currentTime
      elapsedTime = 0

      // create a new audio source and start it from the beginning
      audioSource = audioContext.createBufferSource()
      audioSource.buffer = currentAudioBuffer
      audioSource.connect(audioContext.destination)
      audioSource.start(0)
      requestAnimationFrame(updateProgress) // Start updating progress
    }

    playButton.disabled = true
  }

  function stopAudio() {
    if (audioSource) {
      elapsedTime = audioContext.currentTime - startTime
      audioSource.stop()
      audioSource = null
      isPaused = true
      playButton.disabled = false
    }
  }

  function updateProgress() {
    const elapsed = isPaused ? elapsedTime : audioContext.currentTime - startTime
    const progress = elapsed / currentAudioBuffer.duration
    progressElement.value = progress * 100

    // Continue updating the progress even if the audio is paused
    requestAnimationFrame(updateProgress)
  }

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

      startTime = 0
      elapsedTime = 0
      progressElement.value = 0
    }
  })

  preloadAudio().then(() => {
    currentAudioBuffer = audioBuffers[currentAudioIndex.get()]
  })
})
