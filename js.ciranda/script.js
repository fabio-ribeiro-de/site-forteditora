const wrapper = document.querySelector(".wrapper"),
  musicImg = wrapper.querySelector(".img-area img"),
  musicName = wrapper.querySelector(".song-details .name"),
  musicArtist = wrapper.querySelector(".song-details .artist"),
  mainAudio = wrapper.querySelector("#main-audio"),
  playPauseBtn = wrapper.querySelector(".play-pause"),
  prevBtn = wrapper.querySelector("#prev"),
  nextBtn = wrapper.querySelector("#next"),
  progressArea = wrapper.querySelector(".progress-area"),
  progressBar = wrapper.querySelector(".progress-bar"),
  musicList = wrapper.querySelector(".music-list"),
  showMoreBtn = wrapper.querySelector("#more-music"),
  hideMusicBtn = musicList.querySelector("#close");

let musicIndex = 1;

//Chamando a função de carregamento de música assim que a janela for carregada.
window.addEventListener(
  "load", () => {
    loadMusic(musicIndex);
    playingNow();
  }

)

//---------------------------- FUNÇÕES ---------------------------------------


//Função de carregar música
function loadMusic(indexNumb) {
  musicName.innerText = allMusic[indexNumb - 1].name;
  musicArtist.innerText = allMusic[indexNumb - 1].artist;
  musicImg.src = `../assets-ciranda/capa-album/${allMusic[indexNumb - 1].img}.png`;
  mainAudio.src = `../assets-ciranda/musicas-ciranda/${allMusic[indexNumb - 1].src}.mp3`;

}

//Função de play na música
function playMusic() {
  wrapper.classList.add("paused");
  playPauseBtn.querySelector("i").innerText = "pause";
  mainAudio.play();
}

//Função de pausar música
function pauseMusic() {
  wrapper.classList.remove("paused");
  playPauseBtn.querySelector("i").innerText = "play_arrow";
  mainAudio.pause();
}

//Função para passar a música
function nextMusic() {
  musicIndex++;

  //Verifica se o index é maior do que o final do array, se verdadeiro, o index assume valor 1, se não, continua no mesmo valor.
  musicIndex > allMusic.length ? musicIndex = 1 : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}

//Função para voltar a música
function prevMusic() {
  musicIndex--;

  //Verifica se o index da música é menor do que 1, se for, aplica o array até o final da lista, se não, continua no mesmo index
  musicIndex < 1 ? musicIndex = allMusic.length : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}



//---------------------------- EVENTOS ---------------------------------------


//Evento de pausa ou play na música
playPauseBtn.addEventListener(
  "click",
  () => {
    const isMusicPaused = wrapper.classList.contains("paused");

    //Se isMusicPaused = verdadeiro, pausa a música, se não, play na música
    isMusicPaused ? pauseMusic() : playMusic();
    playingNow();
  }
);

//Evento para passar a próxima música
nextBtn.addEventListener(
  "click",
  () => {
    nextMusic();
  }
);

//Evento para passar a próxima música
prevBtn.addEventListener(
  "click",
  () => {
    prevMusic();
  }
);

//Evento de update da barra de progresso
mainAudio.addEventListener(
  "timeupdate", (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration;
    let progressWidth = (currentTime / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;

    let musicCurrentTime = wrapper.querySelector(".current"),
      musicDuration = wrapper.querySelector(".duration");

    mainAudio.addEventListener(
      "loadeddata", () => {


        //Atualização da duração total da música
        let audioDuration = mainAudio.duration;
        //Cálculo do total de minutos da música
        let totalMin = Math.floor(audioDuration / 60);
        //Cálculo do total dos segundos da música
        let totalSec = Math.floor(audioDuration % 60);
        if (totalSec < 10) {
          totalSec = `0${totalSec}`;
        }

        musicDuration.innerText = `${totalMin}:${totalSec}`;

      }
    );

    //Atualização da execução da música
    //let audioDuration = mainAudio.currentTime;
    //Cálculo do total de minutos da música
    let currentMin = Math.floor(currentTime / 60);
    //Cálculo do total dos segundos da música
    let currentSec = Math.floor(currentTime % 60);
    if (currentSec < 10) {
      currentSec = `0${currentSec}`;
    }

    musicCurrentTime.innerText = `${currentMin}:${currentSec}`;

  }
);

//Avançar música para onde clicar na barra de progresso
progressArea.addEventListener(
  "click", (e) => {
    let progressWidthval = progressArea.clientWidth;
    let clickedOffsetX = e.offsetX;
    let songDuration = mainAudio.duration;

    mainAudio.currentTime = (clickedOffsetX / progressWidthval) * songDuration;
    playMusic();
  }
)

//Botão de repetir
const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener(
  "click", () => {
    let getText = repeatBtn.innerText;
    switch (getText) {
      case "repeat":
        repeatBtn.innerText = "repeat_one";
        repeatBtn.setAttribute("title", "Repetir Atual");
        playingNow();
        break;
      case "repeat_one":
        repeatBtn.innerText = "shuffle";
        repeatBtn.setAttribute("title", "Reprodução Aleatória");
        playingNow();
        break;
      case "shuffle":
        repeatBtn.innerText = "repeat";
        repeatBtn.setAttribute("title", "Continuar Playlist");
        playingNow();
        break;
    }
  }
)

mainAudio.addEventListener(
  "ended", () => {
    let getText = repeatBtn.innerText;
    switch (getText) {
      case "repeat":
        nextMusic();
        playingNow();
        break;
      case "repeat_one":
        mainAudio.currentTime = 0;
        loadMusic(musicIndex);
        playMusic();
        playingNow();
        break;
      case "shuffle":
        let randIndex = Math.floor((Math.random() * allMusic.length) + 1);
        do {
          randIndex = Math.floor((Math.random() * allMusic.length) + 1);
        } while (musicIndex == randIndex);
        musicIndex = randIndex;
        loadMusic(musicIndex);
        playMusic();
        playingNow();
        break;
    }
  }
)

//Apresenta lista de músicas
showMoreBtn.addEventListener(
  "click", () => {
    musicList.classList.toggle("show");
  }
);

//Fecha lista de músicas
hideMusicBtn.addEventListener(
  "click", () => {
    showMoreBtn.click();
  }
);

const ulTag = wrapper.querySelector("ul");

//Array de musicas para o li
for (let i = 0; i < allMusic.length; i++) {
  let liTag =
    //Abertura tag li dinâmica
    `
        <li li-index="${i + 1}">
          <div class="row">
            <span>${allMusic[i].name}</span>
          </div>
          <audio class="${allMusic[i].src}" src="../assets-ciranda/musicas-ciranda/${allMusic[i].src}.mp3"></audio>
          <span id="${allMusic[i].src}" class="audio-duration" > 1: 25</span>
        </li>
  `;
  //Fechamento tag li dinâmica

  ulTag.insertAdjacentHTML("beforeend", liTag);

  let liAudioTagDuration = ulTag.querySelector(`#${allMusic[i].src}`);
  let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);

  liAudioTag.addEventListener(
    "loadeddata", () => {
      //Atualização da duração total da música
      let audioDuration = liAudioTag.duration;
      //Cálculo do total de minutos da música
      let totalMin = Math.floor(audioDuration / 60);
      //Cálculo do total dos segundos da música
      let totalSec = Math.floor(audioDuration % 60);
      if (totalSec < 10) {
        totalSec = `0${totalSec}`;
      }

      liAudioTagDuration.innerText = `${totalMin}:${totalSec}`;
      liAudioTagDuration.setAttribute("t-duration", `${totalMin}:${totalSec}`);
    }
  );
}

const allLiTags = ulTag.querySelectorAll("li");

function playingNow() {
  for (let j = 0; j < allLiTags.length; j++) {
    let audioTag = allLiTags[j].querySelector(".audio-duration");

    if (allLiTags[j].classList.contains("playing")) {
      allLiTags[j].classList.remove("playing");

      let adDuration = audioTag.getAttribute("t-duration");
      audioTag.innerText = adDuration;
    }

    if (allLiTags[j].getAttribute("li-index") == musicIndex) {
      allLiTags[j].classList.add("playing");
      audioTag.innerText = "Executando";
    }

    allLiTags[j].setAttribute("onclick", "clicked(this)");
  }
}

function clicked(element) {
  let getLiIndex = element.getAttribute("li-index");
  musicIndex = getLiIndex;
  loadMusic(musicIndex);
  playMusic();
  playingNow();
}