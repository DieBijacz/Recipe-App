
const meals = document.querySelector('.container')
const favList = document.querySelector('#fav-list')
const searchText = document.querySelector('#search-text')
const searchBtn = document.querySelector('#search')

getRandomMeal()
fetchFavMeals()

// GET DATA FUNCTIONS
async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();

    const randomMeal = respData.meals[0];

    loadRandomMeal(randomMeal, true)
}
async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData = await resp.json();

    const meal = respData.meals[0]
    return meal
}
async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term)
    const respData = await resp.json()

    const meals = respData.meals
    return meals
}

// ============ GET RANDOM MEAL ============

function loadRandomMeal(mealData, random = false) {
    //remove meal div from container
    meals.innerHTML = ""
    //create new div element with class meal and HTML
    const meal = document.createElement('div')
    meal.classList.add('meal')
    meal.innerHTML = `
    <div class="meal-header">
        ${random ? `
        <span class="random"> Our proposition </span>` : ''}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <button class="btn btn-icon btn-next"><i class="fas fa-chevron-right fa-3x"></i></button>
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="btn btn-icon btn-add-fav fa-lg"><i class="far fa-heart"></i></button>
    </div>
    ` 
    //add listener to that meal to check if added to fav
    meal.querySelector('.meal-header .btn-next').addEventListener('click', (e) => {
        getRandomMeal()
    })
    meal.querySelector('.meal-body .btn-add-fav').addEventListener('click', (e) => {
        //change heart icon
        if(e.target.classList.contains("far")){
            e.target.classList.remove("far")
            e.target.classList.add("fas")
            addToStorage(mealData.idMeal)
            getRandomMeal()
        } else {
            e.target.classList.remove("fas")
            e.target.classList.add("far")
            removeFromStorage(mealData.idMeal)
        }
        fetchFavMeals()
    })
    //add new div to meals list
    meals.appendChild(meal)
}   

// ============== STORAGE ==============

function getFromStorage() {
    const mealsIds = JSON.parse(localStorage.getItem('mealsIds'));
    return mealsIds === null ? [] : mealsIds;
}

function addToStorage(meal) {
    //gets meals from storage
    const mealsIds = getFromStorage()
    //add meal to meals and stringify-ed send to Storage
    localStorage.setItem('mealsIds', JSON.stringify([...mealsIds, meal]))
}

function removeFromStorage(mealId){
    const mealsIds = getFromStorage()    
    localStorage.setItem('mealsIds', JSON.stringify(mealsIds.filter((id) => id !== mealId)))
}

// ============ FAVORITE MEALS ============

//get ids from Storage and push obj to be added to fav
async function fetchFavMeals() {
    //clean the container
    favList.innerHTML = ''
    const mealsIds = getFromStorage()
    for(let i = 0; i < mealsIds.length; i++){
        const mealId = mealsIds[i];
        let meal = await getMealById(mealId);
        addMealToFav(meal)
    }
}

function addMealToFav(mealData) { 
    //create new fav
    const favMeal = document.createElement('li')
    favMeal.innerHTML = `  
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="btn btn-icon clear"><i class="fas fa-times-circle"></i></button>
    ` 
    //delete button on favMeals
    const btn = favMeal.querySelector('.clear')
    btn.addEventListener('click', () => {
        removeFromStorage(mealData.idMeal)

        fetchFavMeals()
    })

    favList.appendChild(favMeal)
}

// ================ SEARCH ================

searchBtn.addEventListener('click', async () => {
    const search = searchText.value
    const meals = await getMealBySearch(search);
    //clear all divs in meal section
    const list = document.querySelector('.container')
    list.innerHTML = ""

    if(meals){
        meals.forEach((meal) => {
            searchedMeals(meal)
        })
    } else {
        alert(`No ${searchText.value}`)
    }

    searchText.value = ""
})
function searchedMeals(mealData) {

    //create new div element with class meal and HTML
    const meal = document.createElement('div')
    meal.classList.add('meal')
    meal.innerHTML = `
    <div class="meal-header">
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="btn btn-icon btn-add-fav fa-lg"><i class="far fa-heart"></i></button>
    </div>
    ` 
    meal.querySelector('.meal-body .btn-add-fav').addEventListener('click', (e) => {
        //change heart icon
        if(e.target.classList.contains("far")){
            e.target.classList.remove("far")
            e.target.classList.add("fas")
            addToStorage(mealData.idMeal)
        } else {
            e.target.classList.remove("fas")
            e.target.classList.add("far")
            removeFromStorage(mealData.idMeal)
        }
        fetchFavMeals()
    })
    //add new div to meals list
    meals.appendChild(meal)
}   