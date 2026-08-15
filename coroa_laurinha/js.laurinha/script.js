const wrapper = document.querySelector(".wrapper"),
  musicImg = document.querySelector(".img-area img"),
  musicName = document.querySelector(".song-details .name"),
  musicArtist = document.querySelector(".song-details .artist"),
  playPauseBtn = document.querySelector(".play-pause"),
  prevBtn = document.querySelector("#prev"),
  nextBtn = document.querySelector("#next"),
  mainAudio = document.querySelector("#main-audio"),
  mainVideo = document.querySelector("#main-video"),
  progressArea = document.querySelector(".progress-area"),
  progressBar = document.querySelector(".progress-bar"),
  musicList = document.querySelector(".music-list"),
  moreMusicBtn = document.querySelector("#more-music"),
  closemoreMusic = document.querySelector("#close"),
  repeatBtn = document.querySelector("#repeat-plist");

let musicIndex = Math.floor(Math.random() * allMusic.length) + 1;
let isMusicPlaying = false;
let isShuffle = false;
let activeMedia = mainAudio;

const AUDIO_DIR = "assets/audios";
const VIDEO_DIR = "assets/videos";

function getMediaPath(item) {
  if (item.url) return item.url;
  return item.type === "video"
    ? `${VIDEO_DIR}/${item.src}.mp4`
    : `${AUDIO_DIR}/${item.src}.mp3`;
}



function formatTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

window.addEventListener("load", () => {
  loadMusic(musicIndex);
  playingNow();
});

function loadMusic(indexNumb) {
  const item = allMusic[indexNumb - 1];
  if (!item) return;

  musicName.innerText = item.name;
  musicArtist.innerText = item.artist;
  musicImg.src = `assets/capa-album/${item.img}.png`;

  if (item.type === "video" && mainVideo) {
    activeMedia = mainVideo;
    mainVideo.poster = `assets/images/${item.img}.jpg`;
    mainVideo.src = getMediaPath(item);
    mainAudio.pause();
    mainAudio.removeAttribute("src");
    wrapper.classList.add("mode-video");
    console.log("[player] VÍDEO:", mainVideo.src);
  } else {
    activeMedia = mainAudio;
    mainAudio.src = getMediaPath(item);
    if (mainVideo) {
      mainVideo.pause();
      mainVideo.removeAttribute("src");
    }
    wrapper.classList.remove("mode-video");
    console.log("[player] ÁUDIO:", mainAudio.src);
  }
}

function playMusic() {
  const p = activeMedia.play();
  if (p && p.catch) p.catch(() => console.warn("[player] Reprodução bloqueada:", activeMedia.src));
  isMusicPlaying = true;
  playPauseBtn.querySelector("i").innerText = "pause";
}

function pauseMusic() {
  activeMedia.pause();
  isMusicPlaying = false;
  playPauseBtn.querySelector("i").innerText = "play_arrow";
}

playPauseBtn.addEventListener("click", () => {
  isMusicPlaying ? pauseMusic() : playMusic();
});

[mainAudio, mainVideo].forEach(media => {
  if (!media) return;
  media.addEventListener("timeupdate", updateProgress);
  media.addEventListener("loadedmetadata", () => {
    document.querySelector(".timer .duration").innerText = formatTime(media.duration);
  });
  media.addEventListener("ended", handleEnded);
  media.addEventListener("error", () => {
    console.error("[player] Falha ao carregar mídia:", media.currentSrc || media.src);
    wrapper.classList.remove("mode-video");
  });
});

function updateProgress(e) {
  const { currentTime, duration } = e.target;
  if (!duration || isNaN(duration)) return;
  progressBar.style.width = `${(currentTime / duration) * 100}%`;
  document.querySelector(".timer .current").innerText = formatTime(currentTime);
}

progressArea.addEventListener("click", (e) => {
  const duration = activeMedia.duration;
  if (!duration || isNaN(duration)) return;
  activeMedia.currentTime = (e.offsetX / progressArea.clientWidth) * duration;
});

function handleEnded() {
  if (repeatBtn.innerText === "repeat_one") {
    activeMedia.currentTime = 0;
    playMusic();
  } else {
    nextMusic();
  }
}

function randomIndex(current) {
  if (allMusic.length <= 1) return 1;
  let idx;
  do {
    idx = Math.floor(Math.random() * allMusic.length) + 1;
  } while (idx === current);
  return idx;
}

nextBtn.addEventListener("click", nextMusic);
prevBtn.addEventListener("click", prevMusic);

function nextMusic() {
  musicIndex = isShuffle ? randomIndex(musicIndex) : (musicIndex >= allMusic.length ? 1 : musicIndex + 1);
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}

function prevMusic() {
  musicIndex = isShuffle ? randomIndex(musicIndex) : (musicIndex <= 1 ? allMusic.length : musicIndex - 1);
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}

repeatBtn.addEventListener("click", () => {
  const icon = repeatBtn.innerText;
  if (icon === "repeat") {
    repeatBtn.innerText = "repeat_one";
  } else if (icon === "repeat_one") {
    repeatBtn.innerText = "shuffle";
    isShuffle = true;
  } else {
    repeatBtn.innerText = "repeat";
    isShuffle = false;
  }
});

const ulTag = document.querySelector("ul");
for (let i = 0; i < allMusic.length; i++) {
  const item = allMusic[i];
  let liTag = `<li li-index="${i + 1}" onclick="clicked(this)">
    <div class="row">
      <span>${item.name}</span>
      <p class="${item.type}"></p>
    </div>
    <span class="audio-duration">${item.type === "video" ? "VÍDEO" : "3:40"}</span>`;

  if (item.type === "audio") {
    liTag += `<audio class="${item.src}" src="${AUDIO_DIR}/${item.src}.mp3"></audio>`;
  }
  liTag += `</li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag);

  if (item.type === "audio") {
    const liAudioTag = ulTag.querySelector(`.${item.src}`);
    if (liAudioTag) {
      liAudioTag.addEventListener("loadeddata", () => {
        const durationTag = ulTag.querySelector(`li[li-index="${i + 1}"] .audio-duration`);
        if (durationTag) durationTag.innerText = formatTime(liAudioTag.duration);
      });
    }
  }
}

function clicked(li) {
  musicIndex = Number(li.getAttribute("li-index"));
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}

function playingNow() {
  document.querySelectorAll(".music-list ul li").forEach(li => li.classList.remove("playing"));
  const li = document.querySelector(`.music-list ul li:nth-child(${musicIndex})`);
  if (li) {
    li.classList.add("playing");
    musicList.scrollTop = li.offsetTop - 50;
  }
}

const fullscreenBtn = document.querySelector("#fullscreen-btn");

function toggleFullscreen() {
  if (!mainVideo) return;
  const container = document.querySelector(".img-area");
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (mainVideo.webkitEnterFullscreen) {
      mainVideo.webkitEnterFullscreen(); // fallback iOS
    }
  }
}

function updateFullscreenIcon() {
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  fullscreenBtn.querySelector("i").innerText = isFs ? "fullscreen_exit" : "fullscreen";
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenIcon);
  document.addEventListener("webkitfullscreenchange", updateFullscreenIcon);
}

const centerPlayPauseBtn = document.querySelector("#center-play-pause");

// Sincroniza o ícone dos DOIS botões (controles + overlay central)
function syncPlayPauseIcons() {
  const icon = isMusicPlaying ? "pause" : "play_arrow";
  playPauseBtn.querySelector("i").innerText = icon;
  if (centerPlayPauseBtn) centerPlayPauseBtn.querySelector("i").innerText = icon;
}

// Ajuste nas funções existentes: troque o innerText manual pela função
function playMusic() {
  const p = activeMedia.play();
  if (p && p.catch) p.catch(() => console.warn("[player] Reprodução bloqueada:", activeMedia.src));
  isMusicPlaying = true;
  syncPlayPauseIcons();
}

function pauseMusic() {
  activeMedia.pause();
  isMusicPlaying = false;
  syncPlayPauseIcons();
  showControls(); // controles ficam visíveis enquanto pausado
}

// Clique no overlay central alterna play/pause do vídeo
if (centerPlayPauseBtn) {
  centerPlayPauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isMusicPlaying ? pauseMusic() : playMusic();
  });
}

const imgArea = document.querySelector(".img-area");
const HIDE_DELAY = 2500; // 2,5s de cursor parado
let controlsTimer = null;

function showControls() {
  if (!wrapper.classList.contains("mode-video")) return;
  imgArea.classList.remove("controls-hidden");
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(() => {
    if (isMusicPlaying) imgArea.classList.add("controls-hidden");
  }, HIDE_DELAY);
}

imgArea.addEventListener("mousemove", showControls);
imgArea.addEventListener("mouseenter", showControls);
imgArea.addEventListener("mouseleave", () => {
  if (isMusicPlaying) imgArea.classList.add("controls-hidden");
});

moreMusicBtn.addEventListener("click", () => musicList.classList.add("show"));
closemoreMusic.addEventListener("click", () => musicList.classList.remove("show"));