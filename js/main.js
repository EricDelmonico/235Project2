"use strict";
window.onload = init;
function init(){
    document.querySelector("#searchButton").onclick = search;
    document.querySelector("#sortby").onchange = changeSort;
    document.querySelector("#nextButton").onclick = movePage;
    document.querySelector("#prevButton").onclick = movePage;
    document.querySelector("#clearButton").onclick = clearResults;
}

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
        let params = sortString.split("_");
        sortString = `&order_by=${params[0]}&sort=${params[1]}&score=0.1`;
    }
}

function clearResults(){
    // get rid of the page buttons when there's no results
    nextButton.style.display = "none";
    prevButton.style.display = "none";

    let resultsContainer = document.querySelector("#results");
    // Some debug stuff
    let needToClear = resultsContainer.childElementCount > 0;
    if (needToClear){
        console.log("clearing past results...")
    }
    // end debug stuff

    while (resultsContainer.childElementCount > 0){
        resultsContainer.removeChild(resultsContainer.firstChild);
    }

    // Some debug stuff
    if (needToClear){
        console.log("results cleared!")
    }
    // end debug stuff
}

let searchTerm = "";
function search(){
    // Clear any existing results on the page
    clearResults();

    console.log("searching");
    // get the necessary info to make a search
    searchTerm = document.querySelector("#searchTerm").value;
    // processing the user input, and leave if there's nothing
    searchTerm = encodeURIComponent(searchTerm.trim());
    if (searchTerm.length <= 0) {
        console.log("oh no");
        return;
    }

    // if we got this far, add the term to the url
    let url = `https://api.jikan.moe/v3/search/anime?q=${searchTerm}${sortString}${pageString}`;
    console.log(url);

    // make the search using jQuery (boldly go)
    $.ajax({
        dataType: "json",
        url: url,
        data: null, //for now kek
        success: querySuccess
    });
}

function searchByGenre(){
    // Clear existing results
    clearResults();

    // get the necessary info to make a search
    searchTerm = document.querySelector("#genre").value;
    // processing the user input, and leave if there's nothing
    searchTerm = encodeURIComponent(searchTerm.trim());
    if (searchTerm.length <= 0) {
        console.log("oh no");
        return;
    }

    // if we got this far, add the term to the url
    let url = `https://api.jikan.moe/v3/search/anime?q=${searchTerm}${sortString}${pageString}`;
    console.log(url);

    // make the search using jQuery (boldly go)
    $.ajax({
        dataType: "json",
        url: url,
        data: null, //for now kek
        success: querySuccess
    });
}

function querySuccess(obj){
    console.log("search success!");
    if (obj.error){
        // if something went wrong, save 
        // reason and abandon ship, yeet
        let msg = obj.error;
        console.log("oh no");
        console.log(obj.error);
        return;
    }

    // Get our data pumped out
    let resultsContainer = document.querySelector("#results");
    for (let anime of obj.results){
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