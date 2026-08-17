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
  repeatBtn = document.querySelector("#repeat-plist"),
  fullscreenBtn = document.querySelector("#fullscreen-btn"),
  centerPlayPauseBtn = document.querySelector("#center-play-pause");

let musicIndex = Math.floor(Math.random() * allMusic.length) + 1;
let isMusicPlaying = false;
let isShuffle = false;
let activeMedia = mainAudio;

const AUDIO_DIR = "/coroa_laurinha/assets/musicas";

function getMediaPath(item) {
  if (item.url) return item.url;
  return AUDIO_DIR + "/" + item.src + ".mp3";
}

function formatTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return "0:00";
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

window.addEventListener("load", function () {
  loadMusic(musicIndex);
  playingNow();
});

function stopVideo() {
  if (mainVideo && mainVideo.tagName === "IFRAME") {
    mainVideo.src = "";
  }
}

function loadMusic(indexNumb) {
  var item = allMusic[indexNumb - 1];
  if (!item) return;

  musicName.innerText = item.name;
  musicArtist.innerText = item.artist;
  musicImg.src = "/coroa_laurinha/assets/capa-album/" + item.img + ".png";

  stopVideo();

  if (item.type === "video") {
    wrapper.classList.add("mode-video");
    if (mainAudio) {
      mainAudio.pause();
      mainAudio.removeAttribute("src");
    }
    isMusicPlaying = false;
    syncPlayPauseIcons();
    if (mainVideo && mainVideo.tagName === "IFRAME") {
      mainVideo.src = item.url || "";
    }
    if (centerPlayPauseBtn) centerPlayPauseBtn.style.display = "none";
  } else {
    wrapper.classList.remove("mode-video");
    activeMedia = mainAudio;
    mainAudio.src = getMediaPath(item);
    if (centerPlayPauseBtn) centerPlayPauseBtn.style.display = "flex";
    console.log("[player] ÁUDIO:", mainAudio.src);
  }
}

function playMusic() {
  if (wrapper.classList.contains("mode-video")) return;
  var p = activeMedia.play();
  if (p && p.catch) p.catch(function () { console.warn("[player] Reprodução bloqueada:", activeMedia.src); });
  isMusicPlaying = true;
  syncPlayPauseIcons();
}

function pauseMusic() {
  if (wrapper.classList.contains("mode-video")) return;
  activeMedia.pause();
  isMusicPlaying = false;
  syncPlayPauseIcons();
  showControls();
}

function syncPlayPauseIcons() {
  var icon = isMusicPlaying ? "pause" : "play_arrow";
  playPauseBtn.querySelector("i").innerText = icon;
  if (centerPlayPauseBtn) centerPlayPauseBtn.querySelector("i").innerText = icon;
}

playPauseBtn.addEventListener("click", function () {
  isMusicPlaying ? pauseMusic() : playMusic();
});

if (centerPlayPauseBtn) {
  centerPlayPauseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    isMusicPlaying ? pauseMusic() : playMusic();
  });
}

if (mainAudio) {
  mainAudio.addEventListener("timeupdate", updateProgress);
  mainAudio.addEventListener("loadedmetadata", function () {
    document.querySelector(".timer .duration").innerText = formatTime(mainAudio.duration);
  });
  mainAudio.addEventListener("ended", handleEnded);
  mainAudio.addEventListener("error", function () {
    console.error("[player] Falha ao carregar mídia:", mainAudio.currentSrc || mainAudio.src);
  });
}

function updateProgress(e) {
  var currentTime = e.target.currentTime;
  var duration = e.target.duration;
  if (!duration || isNaN(duration)) return;
  progressBar.style.width = (currentTime / duration) * 100 + "%";
  document.querySelector(".timer .current").innerText = formatTime(currentTime);
}

progressArea.addEventListener("click", function (e) {
  var duration = activeMedia.duration;
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
  var idx;
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

repeatBtn.addEventListener("click", function () {
  var icon = repeatBtn.innerText;
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

var ulTag = document.querySelector("ul");
for (var i = 0; i < allMusic.length; i++) {
  var item = allMusic[i];
  var liTag = '<li li-index="' + (i + 1) + '" onclick="clicked(this)">' +
    '<div class="row"><span>' + item.name + '</span><p class="' + item.type + '"></p></div>' +
    '<span class="audio-duration">' + (item.type === "video" ? "VÍDEO" : "3:40") + '</span>';

  if (item.type === "audio") {
    liTag += '<audio class="' + item.src + '" src="' + AUDIO_DIR + '/' + item.src + '.mp3"></audio>';
  }
  liTag += '</li>';
  ulTag.insertAdjacentHTML("beforeend", liTag);

  if (item.type === "audio") {
    var liAudioTag = ulTag.querySelector("." + item.src);
    if (liAudioTag) {
      liAudioTag.addEventListener("loadeddata", (function (idx) {
        return function () {
          var durationTag = ulTag.querySelector('li[li-index="' + (idx + 1) + '"] .audio-duration');
          if (durationTag) durationTag.innerText = formatTime(liAudioTag.duration);
        };
      })(i));
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
  document.querySelectorAll(".music-list ul li").forEach(function (li) { li.classList.remove("playing"); });
  var li = document.querySelector(".music-list ul li:nth-child(" + musicIndex + ")");
  if (li) {
    li.classList.add("playing");
    musicList.scrollTop = li.offsetTop - 50;
  }
}

var imgArea = document.querySelector(".img-area");
var HIDE_DELAY = 2500;
var controlsTimer = null;

function showControls() {
  if (!wrapper.classList.contains("mode-video")) return;
  imgArea.classList.remove("controls-hidden");
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(function () {
    if (isMusicPlaying) imgArea.classList.add("controls-hidden");
  }, HIDE_DELAY);
}

imgArea.addEventListener("mousemove", showControls);
imgArea.addEventListener("mouseenter", showControls);
imgArea.addEventListener("mouseleave", function () {
  if (isMusicPlaying) imgArea.classList.add("controls-hidden");
});

moreMusicBtn.addEventListener("click", function () { musicList.classList.add("show"); });
closemoreMusic.addEventListener("click", function () { musicList.classList.remove("show"); });