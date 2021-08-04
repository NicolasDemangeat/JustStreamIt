let url = `http://localhost:8000/api/v1/titles/?imdb_score_min=9.6&sort_by=-imdb_score,-votes`
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

const test = async function (index) {
    let response = await fetch('http://localhost:8000/api/v1/titles/');
    let data = await response.json();
    let img1Src = data.results[index].image_url;
    
    console.log(img1Src);
    return img1Src;
}
test(1)

function getID(url) {
    return fetch(url).then(response => response.json()).then(function(data) {
        let id = data.results[0]["id"];
        return `http://localhost:8000/api/v1/titles/${id}`
    });
};

function getDataByID(url) {
    // commentaire 
    return fetch(url).then(response => response.json()).then(function(data) {
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
        // let imageUrl = data.image_url;
        // let title = data.title;
        // let genresArr = data.genres;
        // let publishedDate = data.date_published;
        // let rated = data.rated;
        // let scoreImdb = data.imdb_score;
        // let directorsArr = data.directors;
        // let actorsArr = data.actors;
        // let duration = data.duration;
        // let countriesArr = data.countries;
        // let boxOffice = data.worldwide_gross_income;
        // let description = data.long_description;
        return mapData;
    });
};

let modal = null;
const openModal = function (e, url) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    target.style.display = 'flex';
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);    
    let listUl = document.getElementById('js-liste-infos');
    let imageBestMovie = document.getElementById('js-img-movie');
    getID(url).then(id => getDataByID(id)).then(function (data){
        imageBestMovie.src = data.get('imageUrl');
        listUl.innerHTML = `<li>Titre : ${data.get('title')}</li>
                            <li>Elément 2</li>`;
    });
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

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal);
});

let dataBestMovie = createHeader(url);
getID('http://localhost:8000/api/v1/titles/').then(id => getDataByID(id)).then(data => console.log('cest ICI !!!!!' + data.get('genresArr')));
// fetch('http://localhost:8000/api/v1/titles/12749596')
//     .then(response => response.json()
//         .then(data3 => console.log(data3)))
//     .catch(e => console.log('Erreur !!!!!: ' + e));
