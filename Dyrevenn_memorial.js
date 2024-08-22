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

class Cat {
    constructor(name, color, where, city, birthdate, status, date, reason, adoptedDate, newOwner, croppedImageId, uncroppedImageId) {
        this.name = name;
        this.color = color;
        this.where = where;
        this.city = city;
        this.birthdate = birthdate;
        this.status = status;
        this.date = date;
        this.reason = reason;
        this.adoptedDate = adoptedDate;
        this.newOwner = newOwner;
        this.croppedImageId = croppedImageId;
        this.uncroppedImageId = uncroppedImageId;
    }
}

async function getCats() {
    const cats = localStorage.getItem('cats');
    console.log('Retrieved cats from localStorage:', cats);
    return cats ? JSON.parse(cats) : [];
}

async function displayDeceasedCats() {
    const memorialDisplay = document.getElementById('memorial-display');
    memorialDisplay.innerHTML = '';
    const cats = (await getCats()).filter(cat => cat.status === 'Avdød');

    for (const cat of cats) {
        const catElement = document.createElement('div');
        catElement.classList.add('cat-element');
        
        // Get the image from IndexedDB
        const imageUrl = await getImageFromIndexedDB(cat.croppedImageId);
        console.log('Image URL for cat', cat.name, ':', imageUrl);

        if (!imageUrl) {
            console.error(`Image not found for cat: ${cat.name}`);
            continue;
        }

        catElement.innerHTML = `
            <h2 class="cat-name">${cat.name}</h2>
            <p class="cat_life">${cat.birthdate} - ${cat.date}</p>
            <img src="${imageUrl}" alt="Rest in peace ${cat.name}" class="cat-image">
        `;
        memorialDisplay.appendChild(catElement);
    }
}

window.onload = async function() {
    await displayDeceasedCats();
};
