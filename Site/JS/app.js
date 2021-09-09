const urlBestMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7`;
const urlAdventureMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=adventure`;
const urlSifiMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=Sci-Fi`;
const urlComedyMovies = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&page_size=7&genre=comedy`;
const urlBestMovie = `http://localhost:8000/api/v1/titles/9008642`

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
        this.ratio = 7/4
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.container.style.width = (this.ratio * 100) + "%"
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.createCarouselItems(this.url)
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

    createCarouselItems(url) {
        fetch(url).then(reponse => reponse.json()).then(data => {
            for (let dataMovie of data.results){
                let carouselItem = this.createDivWithClass('carousel__item')
                carouselItem.style.width = ((100 / this.options.slideVisible / this.ratio) + "%")
                let item = this.createDivWithClass('item')
                let a = document.createElement('a')
                a.setAttribute('href', '#modal1')
                a.setAttribute('class', 'js-modal')
                a.setAttribute('name', dataMovie.url)                
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
async function createHeader(url) {
    let response = await fetch(url);
    let data = await response.json();
    let bestMovieId = data.results[0]["id"];
    let response2 = await fetch(`http://localhost:8000/api/v1/titles/${bestMovieId}`);
    let data2 = await response2.json();
    let urlImgBestMovie = data2.image_url;
    let srcImageBestMovie = document.getElementById('img_best_movie');
    let figcaption = document.getElementsByTagName('figcaption');
    let titleBestMovie = document.getElementById('title_best_movie');
    figcaption[0].textContent = data2.long_description;
    srcImageBestMovie.setAttribute('src', urlImgBestMovie);
    titleBestMovie.textContent = data2.title;
    return data2;
};


/**
 * Send a request using fetch api.
 * Need an URL with the ID of the movie.
 * Return a Map object with all the data of the movie.
 * @param {String} url 
 * @returns {Map}
 */
function getDataByID(url) {
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
        mapData.set('boxOffice', data.worldwide_gross_income);
        mapData.set('description', data.long_description);

        return mapData;
    });
};


/// Modal section
let modal = null;
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

const stopPropagation = function (e) {
    e.stopPropagation();
};

const loadModal = function (url, num=0){
    let listUl = document.getElementById('js-liste-infos');
    let imageBestMovie = document.getElementById('js-img-movie');
    getDataByID(url).then(function (data){
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

document.addEventListener('DOMContentLoaded', function () {

    new Carousel(document.querySelector('#carousel1'), {
        slideToScroll: 1,
        slideVisible: 4
    }, urlBestMovies)

    new Carousel(document.querySelector('#carousel2'), {
        slideToScroll: 1,
        slideVisible: 4
    }, urlAdventureMovies)

    new Carousel(document.querySelector('#carousel3'), {
        slideToScroll: 1,
        slideVisible: 4
    }, urlComedyMovies)

    new Carousel(document.querySelector('#carousel4'), {
        slideToScroll: 1,
        slideVisible: 4
    }, urlSifiMovies)

    let divage = document.createElement('div')
    divage.setAttribute('id', 'okbb')
    document.body.appendChild(divage)
})


while (!!document.getElementById('okbb') === true){
    document.querySelectorAll('.js-modal').forEach(a => {
        console.log(a)
        a.addEventListener('click', openModal);
        a.addEventListener('click', function (){
            if (a.parentNode.nodeName === 'BUTTON'){
                loadModal(urlBestMovie)
            }else{
                loadModal(a.getAttribute('name'))
            }
        });
    });
}

createHeader(urlBestMovies)