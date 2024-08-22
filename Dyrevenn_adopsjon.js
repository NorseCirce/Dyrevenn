

/*Change the width to display rules for adoption*/
document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('.krav ol > li');
    
    listItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation();
            const sublist = item.querySelector('ul');
            if (sublist) {
                if (sublist.style.display === 'block') {
                    sublist.style.display = 'none';
                    item.classList.remove('open');
                } else {
                    sublist.style.display = 'block';
                    item.classList.add('open');
                }
            }
            
            // Adjust the widths and margins of .left and .right elements if width is 600px or above
            if (window.innerWidth >= 600) {
                const contentElement = item.closest('.content');
                const leftElement = contentElement.querySelector('.left');
                const rightElement = contentElement.querySelector('.right');
                
                // Check if any li elements are still open
                const anyOpen = Array.from(listItems).some(li => li.classList.contains('open'));
                
                if (anyOpen) {
                    leftElement.style.width = '80%';  // Adjust width as needed
                    leftElement.style.marginLeft = '0'; // Remove margin when open
                    rightElement.style.width = '20%'; // Adjust width as needed
                    rightElement.style.marginRight = '0'; // Remove margin when open
                } else {
                    leftElement.style.width = '60%';  // Original width
                    leftElement.style.marginLeft = '10%'; // Add margin when closed
                    rightElement.style.width = '40%'; // Original width
                    rightElement.style.marginRight = '10%'; // Add margin when closed
                }
            }
        });
    });
    
    // Adjust the widths and margins for already open items if width is 600px or above
    if (window.innerWidth >= 600) {
        document.querySelectorAll('.krav ol > li.open').forEach(openItem => {
            const contentElement = openItem.closest('.content');
            const leftElement = contentElement.querySelector('.left');
            const rightElement = contentElement.querySelector('.right');
            
            if (leftElement && rightElement) {
                leftElement.style.width = '80%';  // Adjust width as needed
                leftElement.style.marginLeft = '0'; // Remove margin when open
                rightElement.style.width = '20%'; // Adjust width as needed
                rightElement.style.marginRight = '0'; // Remove margin when open
            }
        });
    }
});



/*Display cats for adoptions*/
// Open IndexedDB
const dbPromise = idb.openDB('catsDB', 1);

// Retrieve an image from IndexedDB
async function getImageFromIndexedDB(id) {
    try {
        const db = await dbPromise;
        const imageEntry = await db.get('images', id);
        return imageEntry ? URL.createObjectURL(imageEntry.image) : null;
    } catch (error) {
        console.error('Error retrieving image from IndexedDB:', error);
    }
}

async function getCats() {
    const cats = localStorage.getItem('cats');
    return cats ? JSON.parse(cats) : [];
}

async function displayCat(cat) {
    const catDisplay = document.getElementById('cat-display');
    const catElement = document.createElement('div');
    catElement.classList.add('cat-element');
    
    // Get the image from IndexedDB
    const imageUrl = await getImageFromIndexedDB(cat.croppedImageId);
    
    if (!imageUrl) {
        console.error(`Image not found for cat: ${cat.name}`);
        return;
    }

    catElement.innerHTML = `
        <img src="${imageUrl}" alt="${cat.name}" class="cat-image">
        <div class="cat-name">${cat.name}</div>
    `;
    catElement.addEventListener('click', () => showCatDetails(cat));
    catDisplay.appendChild(catElement);
}

async function displayAllCats(filteredCats) {
    const catDisplay = document.getElementById('cat-display');
    catDisplay.innerHTML = '';
    const cats = filteredCats || await getCats();
    const adoptivsklarCats = cats.filter(cat => cat.status === 'Adoptivsklar');

    for (const cat of adoptivsklarCats) {
        await displayCat(cat);
    }
}

async function showCatDetails(cat) {
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Get the image from IndexedDB
    const imageUrl = await getImageFromIndexedDB(cat.croppedImageId);

    if (!imageUrl) {
        console.error(`Image not found for cat: ${cat.name}`);
        return;
    }

    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">&times;</span>
            <img src="${imageUrl}" alt="${cat.name}" class="popup-image">
            <div class="popup-text">
                <h2>${cat.name}</h2>
                <p>Fødsels dato: ${cat.birthdate}</p>
                <p>Kjønn: ${cat.gender}</p>
                <p>Hvor: ${cat.where}</p>
                <p>Status: ${cat.status}</p>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(popup);
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

async function applyFilters() {
    const genderFilter = window.innerWidth <= 600 ? document.getElementById('gender-select').value : document.querySelector('input[name="gender"]:checked').value;
    const locationFilter = window.innerWidth <= 600 ? document.getElementById('location-select').value : document.querySelector('input[name="location"]:checked').value;

    const cats = await getCats();
    let filteredCats = cats.filter(cat => cat.status === 'Adoptivsklar');

    if (genderFilter !== 'Alle') {
        filteredCats = filteredCats.filter(cat => cat.gender === genderFilter);
    }

    if (locationFilter !== 'Alle') {
        filteredCats = filteredCats.filter(cat => cat.where === locationFilter);
    }

    await displayAllCats(filteredCats);
}

window.onload = async function() {
    await displayAllCats();

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const locationRadios = document.querySelectorAll('input[name="location"]');
    const genderSelect = document.getElementById('gender-select');
    const locationSelect = document.getElementById('location-select');

    genderRadios.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    locationRadios.forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    genderSelect.addEventListener('change', applyFilters);
    locationSelect.addEventListener('change', applyFilters);
};

