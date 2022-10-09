const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'AnhThu'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('.header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-previous')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    crrIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key,value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: "Chưa quên người yêu cũ",
            singer: "Hà Nhi",
            path: "./assets/music/ChuaQuenNguoiYeuCu.mp3",
            image:
                "https://i.scdn.co/image/ab67616d0000b273157acee05256979fb391366f"
        },
        {
            name: "Bên trên tầng lầu",
            singer: "Tăng Duy Tân",
            path: "./assets/music/BenTrenTangLau-TangDuyTan-7412012.mp3",
            image: "https://avatar-ex-swe.nixcdn.com/song/share/2022/06/09/2/1/a/4/1654766694296.jpg"
        },
        {
            name: "Chuyện đôi ta",
            singer: "DaLabEmceeL",
            path: "./assets/music/ChuyenDoiTa-EmceeLDaLAB.mp3",
            image: "https://i.ytimg.com/vi/6eONmnFB9sw/maxresdefault.jpg"
        },
        {
            name: "Từng là của nhau",
            singer: "Bảo Anh ft. Táo",
            path: "./assets/music/TungLaCuaNhau.mp3",
            image: "https://dj24h.com/wp-content/uploads/2022/08/tung-la-cua-nhau-bao-anh-x-tao.jpg"
        },
        {
            name: "Chưa quên người yêu cũ",
            singer: "Hà Nhi",
            path: "./assets/music/ChuaQuenNguoiYeuCu.mp3",
            image:
                "https://i.scdn.co/image/ab67616d0000b273157acee05256979fb391366f"
        },
        {
            name: "Bên trên tầng lầu",
            singer: "Tăng Duy Tân",
            path: "./assets/music/BenTrenTangLau-TangDuyTan-7412012.mp3",
            image: "https://avatar-ex-swe.nixcdn.com/song/share/2022/06/09/2/1/a/4/1654766694296.jpg"
        },
        {
            name: "Chuyện đôi ta",
            singer: "DaLabEmceeL",
            path: "./assets/music/ChuyenDoiTa-EmceeLDaLAB.mp3",
            image: "https://i.ytimg.com/vi/6eONmnFB9sw/maxresdefault.jpg"
        },
        {
            name: "Từng là của nhau",
            singer: "Bảo Anh ft. Táo",
            path: "./assets/music/TungLaCuaNhau.mp3",
            image: "https://dj24h.com/wp-content/uploads/2022/08/tung-la-cua-nhau-bao-anh-x-tao.jpg"
        },
    ],

    // Xử lí sự kiện
    handleEvents: function () {
        _this = this
        const cdWidth = cd.offsetWidth

        // Xử lí phóng to / thu nhỏ cd
        document.onscroll = function () {
            const scrollY = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollY

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }

        // Quay cd
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)',
            }
        ],
            {
                duration: 10000,
                iterations: Infinity
            })
        cdThumbAnimate.pause()

        // Xử lí khi Play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        // Btn khi play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Btn khi pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Btn previous
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Btn next
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Btn random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Btn repeat
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lí thanh audio tiến độ Progress
        audio.ontimeupdate = function () {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            if (audio.duration) {
                progress.value = progressPercent
            }
        }

        // Xử lí khi tua
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Xử lí next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Khi click thì active từng song

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            
            if (songNode || e.target.closest('.song:not(.option)')) {
                
                // Xử lí khi click vào song
                if (songNode) {
                    _this.crrIndex = Number(songNode.dataset.index)
                    _this.render()
                    _this.loadCurrentSong()
                    audio.play()
                }

                // Xử lí khi click vào option
                if (e.target.closest('.song:not(.option)')) {

                }
            }
        }
    },

    // Chuyển bài hát - Next
    nextSong: function () {
        this.crrIndex++
        if (this.crrIndex >= this.songs.length) {
            this.crrIndex = 0
        }
        this.loadCurrentSong()
    },

    // Chuyển bài hát về trước - Previous
    prevSong: function () {
        this.crrIndex--
        if (this.crrIndex < 0) {
            this.crrIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    // Chuyển bài hát ngẫu nhiên - Random
    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (this.crrIndex === newIndex)
        this.crrIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function () {
        setTimeout(function () {
            if (this.currentIndex === 0) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }
        }, 300);
    },

    // Tải thông tin bài hát đầu tiên vào UI
    loadCurrentSong: function () {
        heading.textContent = this.crrSong.name
        cdThumb.style.backgroundImage = `url(${this.crrSong.image})`
        audio.src = this.crrSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    // Định nghĩa thuộc tính currentSong
    defineProperties: function () {
        Object.defineProperty(this, 'crrSong', {
            get: function () {
                return this.songs[this.crrIndex]
            }
        })
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.crrIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url(${song.image})">
                </div>

                <div class="body">
                    <div class="title">${song.name}</div>
                    <div class="author">${song.singer}</div>
                </div>

                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `})
        playlist.innerHTML = htmls.join('')
    },

    start: function () {
        // Gán cấu hình từ config vào app
        this.loadConfig()

        // Định nghĩa
        this.defineProperties()

        // Xử lý sự kiện
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên
        this.loadCurrentSong()


        // Render ra view app
        this.render()

        // Hiển thị trang thái khi config
        randomBtn.classList.toggle('active', _this.isRandom)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }
}


app.start()
