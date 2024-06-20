console.log("Let's write Javascript")
let currentSong = new Audio();
let prev = document.querySelector(".prev");
let play = document.querySelector(".pause");
let next = document.querySelector(".next");
let currServer = `http://192.168.82.183:3000`;

async function getSongs(folder) {
    let a = await fetch(`${currServer}/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    let songs = []
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith('.mp3')) {
            songs.push(as[i].href.split(`/songs/${folder}/`)[1].replaceAll("%20", " ").split(".mp3")[0]);
        }
    }
    return songs;
}

async function getFolders() {
    let a = await fetch(`${currServer}/songs/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    let folders = [];
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.includes("/songs/") && as[i].href.endsWith("/")) {
            folders.push(as[i].innerHTML.split("/")[0]);
        }
    }
    return folders;
}

const playMusic = (music, folder) => {
    document.querySelector(".songinfo").innerHTML = `<div class="name">${music.split("-")[0].split(`/songs/${folder}/`)[1].replaceAll("%20", " ")} - <span>${music.split("-")[1].split(".mp3")[0].replaceAll("%20", " ")}</span></div>`;
    currentSong.src = music;
    currentSong.play();
    play.src = "svg/pause.svg";
}

const secondsToMinutes = (time) => {
    let minute = parseInt(time / 60);
    let seconds = parseInt(time % 60);
    let left = minute, right = seconds;
    if (minute < 10) left = `0${minute}`;
    if (seconds < 10) right = `0${seconds}`;
    return `${left}:${right}`;
}

async function main() {
    let folders = await getFolders();
    for (const fold of folders) {
        document.querySelector(".cardContainer").innerHTML += `<div class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    id="play">
                                    <path
                                        d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z">
                                    </path>
                                </svg>
                            </div>
                            <img src="covers/${fold}.png" alt="card">

                            <div class="playlist-name">${fold}</div>

                        </div>`
    }
    let folder = folders[0];
    folder = folder.replaceAll(" ", "%20");
    let songs;
    async function spotify() {
        songs = await getSongs(folder);
        let song_ul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        currentSong.src = `${currServer}/songs/${folder}/` + songs[0] + ".mp3";
        let html = "";
        for (const song of songs) {
            html += `<li>
                                <div class="song-left flex"><img class="color-invert" src="svg/music.svg" alt="m">
                                <div class="info">
                                    <div class="name">${song.split("-")[0].replaceAll("%20", " ")}</div>
                                    <div class="artist">${song.split("-")[1].replaceAll("%20", " ")}</div>
                                </div></div>
                                <img src="svg/songplay.svg" alt="play" width="20px" class="play-icon color-invert"></li>`;
        }
        song_ul.innerHTML = html;
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            let el = e.getElementsByTagName("div")[1];
            let music = el.getElementsByTagName("div")[0].innerHTML + "-" + el.getElementsByTagName("div")[1].innerHTML + ".mp3";
            music = `${currServer}/songs/${folder}/` + music;
            e.addEventListener("click", element => {
                playMusic(music, folder);
            })
        })
    }
    spotify();
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async element => {
            folder = e.querySelector(".playlist-name").innerHTML;
            folder = folder.replaceAll(" ", "%20");
            spotify();
        })
    })

    //event listener for play button
    play.addEventListener("click", () => {
        document.querySelector(".songinfo").innerHTML = `<div class="name">${currentSong.src.split("-")[0].split(`/songs/${folder}/`)[1].replaceAll("%20", " ")} - <span>${currentSong.src.split("-")[1].split(".mp3")[0].replaceAll("%20", " ")}</span></div>`;
        if (currentSong.paused) {
            play.src = "svg/pause.svg"
            currentSong.play();
        }
        else {
            play.src = "svg/songplay.svg"
            currentSong.pause();
        }
    })
    //Time Update
    currentSong.addEventListener("timeupdate", () => {
        let current = secondsToMinutes(currentSong.currentTime);
        let total = secondsToMinutes(currentSong.duration);
        if(current == `NaN:NaN`) current = "00:00";
        if(total == `NaN:NaN`) total = "00:00";
        document.querySelector(".songtime").innerHTML = `${current}/${total}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //event listener for previous button
    prev.addEventListener("click", () => {
        let current = currentSong.src.split(`/songs/${folder}/`)[1].split(".mp3")[0];
        current = current.replaceAll("%20", " ");
        let index = 0;
        for (let i = 0; i < songs.length; i++) {
            if (i == 0) continue;
            if (current == songs[i]) {
                index = i; break;
            }
        }
        if (index > 0) {
            music = `${currServer}/songs/${folder}/` + songs[index - 1] + ".mp3";
            playMusic(music, folder);
        }
        else {
            music = `${currServer}/songs/${folder}/` + songs[index] + ".mp3";
            playMusic(music, folder);
        }
    })
    //event listener for next button
    next.addEventListener("click", () => {
        let current = currentSong.src.split(`/songs/${folder}/`)[1].split(".mp3")[0];
        current = current.replaceAll("%20", " ");
        let index = songs.length - 1;
        for (let i = 0; i < songs.length - 1; i++) {
            if (current == songs[i]) {
                index = i; break;
            }
        }
        if (index < songs.length - 1) {
            music = `${currServer}/songs/${folder}/` + songs[index + 1] + ".mp3";
            playMusic(music, folder);
        }
    })
    //event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })
    //event listener for hamburger button
    document.querySelector(".header-left").getElementsByTagName("img")[0].addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });
    //event listener for cross button
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })
}

main()