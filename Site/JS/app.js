const urlBestMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7`;
const urlAdventureMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=adventure`;
const urlSifiMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=Sci-Fi`;
const urlComedyMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=comedy`;

class Carousel {
    /**
     * 
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} options.slideToScroll Number of elements to scroll
     * @param {Object} options.slideVisible Number of elements visible
     */
    constructor(element, options = {}, url) {
        this.element = element
        this.url = url
        this.options = Object.assign({}, {
            slideToScroll : 1,
            slideVisible: 1
        }, options);
        this.currentItem = 0
        this.ratio = 7/4
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.container.style.width = (this.ratio * 100) + "%"
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.createCarouselItems(this.url)
        this.createNavigation()
    }


    /**
     * Create the next and prev button.
     */
    createNavigation() {
        let nextButton = this.createDivWithClass('carousel__next')
        let prevButton = this.createDivWithClass('carousel__prev')
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
    }

    next() {
        this.gotoItem(this.currentItem + this.options.slideToScroll)
    }

    prev() {
        this.gotoItem(this.currentItem - this.options.slideToScroll)
    }

    /**
     * Switch the carousel to the index item
     * @param {Integer} index 
     */
    gotoItem (index) {
        if (index < 0) {
            index = 7 - this.options.slideVisible
        } else if (index >= 7 - this.options.slideVisible + 1) {
            index = 0
        }
        let translateX = index * -100 / 7
        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
        this.currentItem = index
    }

    /**
     * Create a div and set class attribute.
     * @param {String} className 
     * @returns {HTMLElement}
     */
    createDivWithClass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }


    /**
     * Fetch the url, then for every movies in the response
     * we create the carousel item.
     * First, create a div 'carousel__item', then, a div 'item',
     * and an link 'a'.
     * Set all the atributes for every HTML elements.
     * Finaly append elements in the container.
     * @param {String} url 
     */
    createCarouselItems(url) {
        fetch(url).then(reponse => reponse.json()).then(data => {
            for (let dataMovie of data.results){
                let carouselItem = this.createDivWithClass('carousel__item')
                carouselItem.style.width = ((100 / this.options.slideVisible / this.ratio) + "%")
                let item = this.createDivWithClass('item')
                let a = document.createElement('a')
                a.setAttribute('href', '#modal1')
                a.setAttribute('class', 'js-modal')
                a.addEventListener('click', openModal);
                a.addEventListener('click', function(e){
                    e.preventDefault();
                    loadModal(dataMovie.url)
                })
                let image = document.createElement('img')
                image.setAttribute('src', dataMovie.image_url)
                image.setAttribute('alt', dataMovie.title)
                image.setAttribute('href', '#modal1')
                a.appendChild(image)
                item.appendChild(a)
                carouselItem.appendChild(item)
                this.container.appendChild(carouselItem)
            }
        })
    }
}

/**
 * Send a request using fetch api.
 * Recup data of the best movie.
 * Create the BestMovie Header with the data. 
 * @param {String} url 
 * @returns {Promise}
 */
const createHeader = async function (url) {
    let response = await fetch(url);
    let data = await response.json();
    let bestMovieId = data.results[0]["id"];
    let urlBestMovie = `http://localhost:8000/api/v1/titles/${bestMovieId}`
    let response2 = await fetch(urlBestMovie);
    let data2 = await response2.json();
    let urlImgBestMovie = data2.image_url;
    let srcImageBestMovie = document.getElementById('img_best_movie');
    let figcaption = document.getElementsByTagName('figcaption');
    let titleBestMovie = document.getElementById('title_best_movie');
    let link = document.getElementById("btn-link");
    link.addEventListener('click', openModal);
    link.addEventListener('click', function (e){
        e.preventDefault();
        loadModal(urlBestMovie)
    });
    figcaption[0].textContent = data2.long_description;
    srcImageBestMovie.setAttribute('src', urlImgBestMovie);
    titleBestMovie.textContent = data2.title;
};

/**
 * Send a request using fetch api.
 * Need an URL with the ID of the movie.
 * Return a Map object with all the data of the movie.
 * @param {String} url 
 * @returns {Map}
 */
const getDataByID = function (url) {
    return fetch(url).then(response => response.json()).then(data => {
        let mapData = new Map();
        
        mapData.set('imageUrl', data.image_url);
        mapData.set('title', data.title);
        mapData.set('genresArr', data.genres);
        mapData.set('publishedDate', data.date_published);
        mapData.set('rated', data.rated);
        mapData.set('scoreImdb', data.imdb_score);
        mapData.set('directorsArr', data.directors);
        mapData.set('actorsArr', data.actors);
        mapData.set('duration', data.duration);
        mapData.set('countriesArr', data.countries);
        if (data.worldwide_gross_income === null){
            mapData.set('boxOffice', 'No data for this movie.');
        }else{
            mapData.set('boxOffice', data.worldwide_gross_income);
        }        
        mapData.set('description', data.long_description);

        return mapData;
    });
};

/// Modal section
let modal = null;

/**
 * Display the modal and set an event listener to close modal.
 * @param {Event} e 
 */
const openModal = function (e) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    target.style.display = 'flex';
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
};


/**
 * Set the modal style to none.
 * Remove the event listener to close modal.
 * @param {Event} e 
 * @returns 
 */
const closeModal = function (e) {
    if (modal === null) return;
    e.preventDefault();
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
    modal = null;
};

/**
 * Just stop the click on the modal
 * @param {Event} e 
 */
const stopPropagation = function (e) {
    e.stopPropagation();
};

/**
 * The param url must be with ID.
 * We use the function getDataByID to have a Map object in return.
 * Then, we use this Map object to set the <ul> element of the modal with movie's data.
 * @param {String} url 
 */
const loadModal = function (url){
    let listUl = document.getElementById('js-liste-infos');
    let imageBestMovie = document.getElementById('js-img-movie');
    getDataByID(url).then(data => {
        imageBestMovie.src = data.get('imageUrl');
        listUl.innerHTML = `<li><em><strong>Titre : </strong></em>${data.get('title')}</li>
                            <li><em><strong>Genres : </strong></em>${data.get('genresArr')}</li>
                            <li><em><strong>Date de sortie : </strong></em>${data.get('publishedDate')}</li>
                            <li><em><strong>Classification cinématographique : </strong></em>${data.get('rated')}</li>
                            <li><em><strong>Score IMDB : </strong></em>${data.get('scoreImdb')}</li>
                            <li><em><strong>Réalisateurs : </strong></em>${data.get('directorsArr')}</li>
                            <li><em><strong>Acteurs : </strong></em>${data.get('actorsArr')}</li>
                            <li><em><strong>Durée : </strong></em>${data.get('duration')}min</li>
                            <li><em><strong>Pays : </strong></em>${data.get('countriesArr')}</li>
                            <li><em><strong>Box office : </strong></em>${data.get('boxOffice')}</li>
                            <li><em><strong>Synopsis : </strong></em>${data.get('description')}</li>`;
    });    
};
////End modal section

const newCarousel = async function (carouselName, genderUrl) {
    new Carousel(document.querySelector(carouselName), {
        slideToScroll: 1,
        slideVisible: 4
    }, genderUrl)
}

const createCarousel = async function () {
    await newCarousel('#carousel1', urlBestMovies);
    await newCarousel('#carousel2', urlAdventureMovies);
    await newCarousel('#carousel3', urlComedyMovies);
    await newCarousel('#carousel4', urlSifiMovies);
}

const main = async function () {
    await createCarousel();
    await createHeader(urlBestMovies);
  }
  
window.addEventListener('DOMContentLoaded', main);
