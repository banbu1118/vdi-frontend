<template>
  <div class="rdp-wrapper">
    <div ref="displayRef" class="display"></div>
    <textarea ref="clipboardRef" class="clipboard-textarea"></textarea>
    <button ref="fullscreenBtnRef" class="fullscreen-btn" @click="toggleFullscreen">⛶</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getToken } from '../../services/api'
import Guacamole from 'guacamole-common-js'

const displayRef = ref(null)
const clipboardRef = ref(null)
const fullscreenBtnRef = ref(null)

let client = null
let remoteClipboardText = ''
let lastLocalClipboard = ''
let ignoreNextClipboardChange = false
let clipboardSyncEnabled = true
let clipboardCheckInterval = null

let isDragging = false
let hasMoved = false
let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0
const dragThreshold = 5

function isAutoSyncEnabled() {
  return clipboardSyncEnabled
}

async function readClipboard() {
  if (document.hidden) return ''

  if (navigator.clipboard) {
    try {
      return await navigator.clipboard.readText()
    } catch (err) {
      if (err.name !== 'NotAllowedError') { }
    }
  }

  const textarea = clipboardRef.value
  if (!textarea) return ''
  textarea.value = ''
  textarea.select()

  try {
    if (document.execCommand('paste')) {
      return textarea.value
    }
  } catch (err) { }

  return ''
}

async function writeClipboard(text) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) { }
  }

  const textarea = clipboardRef.value
  if (!textarea) return false
  textarea.value = text
  textarea.select()

  try {
    return document.execCommand('copy')
  } catch (err) {
    console.error('Failed to write clipboard:', err)
    return false
  }
}

async function sendClipboardToRemote(showAlert = true) {
  if (!client) {
    if (showAlert) alert('客户端未初始化')
    return
  }

  const text = await readClipboard()
  if (!text) {
    if (showAlert) alert('剪贴板为空或无法读取')
    return
  }

  if (text === lastLocalClipboard) return

  try {
    var stream = client.createClipboardStream('text/plain')
    var writer = new Guacamole.StringWriter(stream)
    writer.sendText(text)
    writer.sendEnd()
    lastLocalClipboard = text
    if (showAlert) alert('已发送剪贴板内容到远程桌面')
  } catch (err) {
    if (showAlert) alert('发送失败: ' + err.message)
  }
}

async function pasteFromRemote(showAlert = true) {
  if (!remoteClipboardText) {
    if (showAlert) alert('远程剪贴板为空')
    return
  }

  ignoreNextClipboardChange = true
  if (await writeClipboard(remoteClipboardText)) {
    if (showAlert) alert('已从远程桌面复制内容到本地剪贴板')
  } else {
    if (showAlert) alert('复制失败，请手动复制')
  }
  setTimeout(() => { ignoreNextClipboardChange = false }, 500)
}

async function connect() {
  try {
    await nextTick()

    if (!displayRef.value) {
      console.error('Display element not found')
      return
    }

    const width = window.innerWidth
    const height = window.innerHeight

    const data = await getToken(width, height)
    const token = data.token

    const tunnel = new Guacamole.WebSocketTunnel('wss://' + window.location.host + '/guacamole/')
    client = new Guacamole.Client(tunnel)

    client.onerror = function (error) {
      console.error('Guacamole error:', error)
      alert('Connection error: ' + error.message)
    }

    client.onstatechange = function (state) { }

    client.onclipboard = function (stream, mimetype) {
      const reader = new Guacamole.StringReader(stream)
      reader.ontext = function (text) {
        remoteClipboardText = text
        if (isAutoSyncEnabled()) {
          pasteFromRemote(false)
        }
      }
      reader.onend = function () { }
    }

    async function checkLocalClipboard() {
      if (!isAutoSyncEnabled()) return
      if (!client) return

      try {
        const currentText = await readClipboard()
        if (currentText && currentText !== lastLocalClipboard && !ignoreNextClipboardChange) {
          await sendClipboardToRemote(false)
        }
      } catch (err) { }
    }

    clipboardCheckInterval = setInterval(checkLocalClipboard, 1000)

    displayRef.value.innerHTML = ''
    displayRef.value.appendChild(client.getDisplay().getElement())

    const mouse = new Guacamole.Mouse(client.getDisplay().getElement())
    mouse.onEach(['mousedown', 'mouseup', 'mousemove', 'mousewheel'],
      e => client.sendMouseState(e.state))

    const keyboard = new Guacamole.Keyboard(window)
    keyboard.onkeydown = keysym => client.sendKeyEvent(1, keysym)
    keyboard.onkeyup = keysym => client.sendKeyEvent(0, keysym)

    client.connect('token=' + token)
  } catch (error) {
    console.error('Failed to connect:', error)
    alert('Failed to connect: ' + error.message)
  }
}

function toggleFullscreen(e) {
  if (!hasMoved) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => { })
    } else {
      document.exitFullscreen().catch(err => { })
    }
  }
  hasMoved = false
}

function onDragStart(e) {
  const btn = fullscreenBtnRef.value
  if (!btn) return

  isDragging = true
  hasMoved = false
  startX = e.clientX
  startY = e.clientY
  const rect = btn.getBoundingClientRect()
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top
}

function onDragMove(e) {
  if (!isDragging) return

  const dx = Math.abs(e.clientX - startX)
  const dy = Math.abs(e.clientY - startY)

  if (dx > dragThreshold || dy > dragThreshold) {
    hasMoved = true
    const btn = fullscreenBtnRef.value
    if (!btn) return
    btn.classList.add('dragging')

    let x = e.clientX - offsetX
    let y = e.clientY - offsetY

    const maxX = window.innerWidth - btn.offsetWidth
    const maxY = window.innerHeight - btn.offsetHeight

    x = Math.max(0, Math.min(x, maxX))
    y = Math.max(0, Math.min(y, maxY))

    btn.style.left = x + 'px'
    btn.style.top = y + 'px'
    btn.style.right = 'auto'
  }
}

function onDragEnd() {
  if (isDragging) {
    isDragging = false
    const btn = fullscreenBtnRef.value
    if (btn) btn.classList.remove('dragging')
  }
}

function onResize() {
  if (client) {
    client.disconnect()
  }
  connect()
}

onMounted(() => {
  nextTick(() => {
    connect()
  })

  const btn = fullscreenBtnRef.value
  if (btn) btn.addEventListener('mousedown', onDragStart)
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (clipboardCheckInterval) {
    clearInterval(clipboardCheckInterval)
  }
  if (client) {
    client.disconnect()
  }

  const btn = fullscreenBtnRef.value
  if (btn) btn.removeEventListener('mousedown', onDragStart)
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.rdp-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  background-color: #000;
}

.display {
  width: 100%;
  height: 100%;
}

.clipboard-textarea {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
}

.fullscreen-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 20px;
  cursor: move;
  z-index: 1000;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.4);
}

.fullscreen-btn.dragging {
  cursor: grabbing;
  background: rgba(0, 0, 0, 0.5);
}
</style>
