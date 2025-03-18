window.addEventListener('scroll', () => {
    const scrollTop = document.querySelector('.scroll-top');
    scrollTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
});

document.querySelector('.scroll-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Enhanced fetch with loading
async function fetchWithLoading(url) {
    document.querySelector('.loading').style.display = 'block';
    try {
        const response = await fetch(url);
        return await response.json();
    } finally {
        document.querySelector('.loading').style.display = 'none';
    }
}

// Fetch trending meals
window.onload = async () => {
    const data = await fetchWithLoading('https://www.themealdb.com/api/json/v1/1/search.php?s=');
    displayTrendingMeals(data.meals?.slice(0, 8) || []);
};

// Search functionality
document.getElementById('searchInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            const data = await fetchWithLoading(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            document.getElementById('trendingMeals').style.display = 'none';
            const searchResults = document.getElementById('searchResults');
            searchResults.style.display = 'grid';
            displayMeals(data.meals || [], searchResults);
        }
    }
});

// Display meals
function displayMeals(meals, container) {
    container.innerHTML = '';
    if (!meals.length) {
        container.innerHTML = '<p style="text-align:center;width:100%;">No recipes found. Try another search! 🍳</p>';
        return;
    }

    meals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.innerHTML = `
            <div class="category-tag">${meal.strCategory}</div>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
        `;
        mealCard.addEventListener('click', () => showMealDetails(meal.idMeal));
        container.appendChild(mealCard);
    });
}

function displayTrendingMeals(meals) {
    displayMeals(meals, document.getElementById('trendingMeals'));
}

// Show meal details
async function showMealDetails(mealId) {
    const data = await fetchWithLoading(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const meal = data.meals?.[0];
    if (!meal) return;

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient?.trim()) {
            ingredients.push(`${meal[`strMeasure${i}`]} ${ingredient}`);
        }
    }

    const modalContent = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
            <h3>${meal.strCategory} • ${meal.strArea}</h3>
            <h3>👨🍳 ${meal.strSource ? '<a href="'+meal.strSource+'" target="_blank">Recipe Source</a>' : 'No source available'}</h3>
        </div>
        
        <h3>Ingredients:</h3>
        <ul class="ingredients-list">
            ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>

        <h3>Instructions:</h3>
        <p>${meal.strInstructions}</p>

        ${meal.strYoutube ? `
        <h3>Video Tutorial:</h3>
        <div class="video-container">
            <iframe src="https://www.youtube.com/embed/${meal.strYoutube.split('v=')[1]}" 
                frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowfullscreen></iframe>
        </div>
        ` : ''}
    `;

    document.getElementById('mealDetails').innerHTML = modalContent;
    document.getElementById('mealModal').style.display = 'block';
}

// Modal close handlers
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('mealModal').style.display = 'none';
});

window.onclick = (event) => {
    if (event.target === document.getElementById('mealModal')) {
        document.getElementById('mealModal').style.display = 'none';
    }
};