//https://www.pinterest.com/pin/412712753337078757/ -- loading cursor
"use strict";
window.onload = init;
let timeLoop;
let genres;
let searchOngoing = false;
function init(){
    document.querySelector("#searchButton").onclick = buttonSearch;
    document.querySelector("#sortby").onchange = changeSort;
    document.querySelector("#nextButton").onclick = movePage;
    document.querySelector("#prevButton").onclick = movePage;
    //document.querySelector("#clearButton").onclick = clearResults;
    genres = {
        "Any Genre" : 0,
        "Action" : 1,
        "Adventure" : 2,
        "Cars" : 3,
        "Comedy" : 4,
        "Dementia" : 5,
        "Demons" : 6,
        "Mystery" : 7,
        "Drama" : 8,
        "Ecchi" : 9,
        "Fantasy" : 10,
        "Game" : 11,
        "Historical" : 13,
        "Horror" : 14,
        "Kids" : 15,
        "Magic" : 16,
        "Martial Arts" : 17,
        "Mecha" : 18,
        "Music" : 19,
        "Parody" : 20,
        "Samurai" : 21,
        "Romance" : 22,
        "School" : 23,
        "Sci Fi" : 24,
        "Shoujo" : 25,
        "Shoujo Ai" : 26,
        "Shounen" : 27,
        "Shounen Ai" : 28,
        "Space" : 29,
        "Sports" : 30,
        "Super Power" : 31,
        "Vampire" : 32,
        "Yaoi" : 33,
        "Yuri" : 34,
        "Harem" : 35,
        "Slice Of Life" : 36,
        "Supernatural" : 37,
        "Military" : 38,
        "Police" : 39,
        "Psychological" : 40,
        "Thriller" : 41,
        "Seinen" : 42,
        "Josei" : 43
    };

    let genresContainer = document.querySelector("#genre");
    for (let g in genres){
        let option = document.createElement("option");
        option.value = g;
        option.innerHTML = g;
        genresContainer.appendChild(option);
    }
    genresContainer.onchange = changeGenre;
    
    document.querySelector("#loadIndicator").style.display = "none";
}

// ANIMATION STUFF
let index = 1;
function cycleAnim(){
    document.querySelector("#loadIndicator").src = `loading/${index}.png`;
    document.querySelector("#loadIndicator").style.display = "inline";
    if (index == 24){
        index = 0;
    }
    index++;
}

function startCursorAnim(){
    timeLoop = setInterval(cycleAnim, 40);
}

function endCursorAnim(){
    if (timeLoop == null)
        return;

    clearInterval(timeLoop);
    document.querySelector("#loadIndicator").style.display = "none";
}
// END ANIMATION STUFF

let nextButton = document.querySelector("#nextButton");
let prevButton = document.querySelector("#prevButton");
nextButton.style.display = "none";
prevButton.style.display = "none";

let sortString = "";
function changeSort(e){
    sortString = e.target.value;
    if (sortString == "none"){
        sortString = "";
    }
    else{
        // this is used in the url during a genre search,
        // which means the user types nothing in, instead
        // just choosing a genre.
        let params = sortString.split("_");
        sortString = `&order_by=${params[0]}&sort=${params[1]}`;
    }
}

let genreString = "";
let currentGenre = 0;
function changeGenre(e){
    genreString = e.target.value;
    currentGenre = genres[genreString];
}

function clearResults(){
    // get rid of the page buttons when there's no results
    nextButton.style.display = "none";
    prevButton.style.display = "none";

    let resultsContainer = document.querySelector("#results");

    while (resultsContainer.childElementCount > 0){
        resultsContainer.removeChild(resultsContainer.firstChild);
    }
}

function buttonSearch(){
    // clear page number, THEN search
    pageString = "&page=1";
    search();
}

let searchTerm = "";
function search(){
    // if there's a search ongoing,
    // don't let the user make another
    if (searchOngoing)
        return;

    // Clear any existing results on the page
    clearResults();
    
    let queryTerm = "q=";

    // get the necessary info to make a search
    searchTerm = document.querySelector("#searchTerm").value;
    // processing the user input, and leave if there's nothing
    searchTerm = encodeURIComponent(searchTerm.trim());
    if (searchTerm.length <= 0) {
        queryTerm = "";
    }
    else{
        queryTerm += searchTerm;
    }

    let genreString = currentGenre > 0 ? `genre=${currentGenre}` : "";
    if(genreString.length > 0) genreString = "&" + genreString;

    // if we got this far, add the term to the url
    let url = `https://api.jikan.moe/v3/search/anime?${queryTerm}${genreString}${pageString}`;

    if (searchTerm.length == 0){
        url += sortString;
    }
    console.log(url);

    // show the loading cursor
    startCursorAnim();

    searchOngoing = true;

    // make the search using jQuery (boldly go)
    $.ajax({
        dataType: "json",
        url: url,
        data: null, //for now kek
        success: querySuccess
    });
}

function querySuccess(obj){

    // hide the loading cursor
    endCursorAnim();
    if (obj.error){
        // if something went wrong, save 
        // reason and abandon ship, yeet
        let msg = obj.error;
        let error = document.createElement("p");
        error.innerHTML = msg;
        resultsContainer.appendChild(error);
        searchOngoing = false;
        return;
    }

    // Get our data pumped out
    let resultsContainer = document.querySelector("#results");
    let results = obj.results;

    // if there's a too short search term and no results, show error
    if (searchTerm.length < 3 && results.length == 0){
        let error = document.createElement("p");
        error.innerHTML = "Search term was less than three characters.";
        resultsContainer.appendChild(error);
        searchOngoing = false;
        return;
    }

    // if there are no results, tell the user
    if (results.length == 0){
        let error = document.createElement("p");
        error.innerHTML = "No results found.";
        resultsContainer.appendChild(error);
        searchOngoing = false;
        return;
    }

    // if the search term has a length of zero,
    // that means the user is just genre searching
    if (sortString.length > 0 && searchTerm.length != 0){
        results.sort((a, b) => b.score - a.score);    
    }

    for (let anime of results){
        if (anime.rated == "Rx")
            continue;

        // Creating the parent element
        let result = document.createElement("div");
        result.className = "result";
        // when clicked, this result will open the anime's MAL page
        result.dataset.page = anime.url;
        result.onclick = openAnime;
        result.style.cursor = "pointer";
        
        // create p elements for the anime's title and score
        let title = document.createElement("p");
        title.innerHTML = anime.title;
        let score = document.createElement("p");
        score.innerHTML = anime.score;

        // show the anime's image
        let resultImage = document.createElement("img");
        resultImage.src = anime["image_url"];
        resultImage.alt = anime.title;

        // Preventing openAnime() from opening
        // an empty page when these are clicked
        title.dataset.page = anime.url;
        score.dataset.page = anime.url;
        resultImage.dataset.page = anime.url;

        // Appending the elements in the order they will appear
        result.appendChild(title);
        result.appendChild(score);
        result.appendChild(resultImage);
        resultsContainer.appendChild(result);
    }

    // if the next page and prev page buttons are disabled, enable them
    if (nextButton.style.display == "none"){
        nextButton.style.display = "inline";
    }
    if (prevButton.style.display == "none"){
        prevButton.style.display = "inline";
    }

    searchOngoing = false;
}

let page = 1;
let pageString = `&page=${page}`;
function movePage(e){
    if (e.target.value.includes("Next")){
        page++;
    }
    else{
        page--;
    }
    // make sure page is more than 0
    if (page < 1){
        page = 1;
    }
    pageString = `&page=${page}`;
    search();
}

function openAnime(e){
    let page = e.target.dataset.page;
    window.open(page, "_blank");
}