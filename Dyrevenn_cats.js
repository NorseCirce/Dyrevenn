class Cat {
    constructor(name, color, gender, where, city, birthdate, status, date, adoptedDate, newOwner, croppedImageId, uncroppedImageId, notes, age, uncertainAge) {
        this.name = name;
        this.color = color;
        this.gender = gender;
        this.where = where;
        this.city = city;
        this.birthdate = birthdate;
        this.status = status;
        this.date = date;
        this.adoptedDate = adoptedDate;
        this.newOwner = newOwner;
        this.croppedImageId = croppedImageId;
        this.uncroppedImageId = uncroppedImageId;
        this.notes = notes;
        this.age = age;
        this.uncertainAge = uncertainAge;
    }
}

const deletedCatsStack = [];

let cropper;
const cropperModal = document.getElementById('cropperModal');
const imageToCrop = document.getElementById('imageToCrop');
const closeBtn = document.getElementsByClassName('close')[0];
const cropButton = document.getElementById('cropButton');
const imageInput = document.getElementById('image');

const fullImageModal = document.getElementById('fullImageModal');
const fullImage = document.getElementById('fullImage');
const closeFullImageBtn = document.getElementsByClassName('close-full-image')[0];

// Initialize IndexedDB
const dbPromise = idb.openDB('catsDB', 1, {
    upgrade(db) {
        db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
    }
});

// Save an image to IndexedDB
async function saveImageToIndexedDB(imageBlob) {
    const db = await dbPromise;
    const id = await db.add('images', { image: imageBlob });
    return id;
}

// Retrieve an image from IndexedDB
async function getImageFromIndexedDB(id) {
    const db = await dbPromise;
    const imageEntry = await db.get('images', id);
    return imageEntry ? URL.createObjectURL(imageEntry.image) : null;
}

// Move images from localStorage to IndexedDB
async function migrateImagesToIndexedDB() {
    let cats = getCats();
    for (let cat of cats) {
        if (cat.image) {
            // Convert base64 to Blob
            const response = await fetch(cat.image);
            const blob = await response.blob();
            const croppedImageId = await saveImageToIndexedDB(blob);

            // Assuming `uncroppedImage` is also stored in base64
            const uncroppedResponse = await fetch(cat.uncroppedImage);
            const uncroppedBlob = await uncroppedResponse.blob();
            const uncroppedImageId = await saveImageToIndexedDB(uncroppedBlob);

            // Update cat object
            cat.croppedImageId = croppedImageId;
            cat.uncroppedImageId = uncroppedImageId;

            // Remove old image data
            delete cat.image;
            delete cat.uncroppedImage;
        }
    }
    // Save updated cats array
    localStorage.setItem('cats', JSON.stringify(cats));
}

imageInput.addEventListener('change', function(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageToCrop.src = e.target.result;
            cropperModal.style.display = 'block';
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1
            });
            document.addEventListener('keydown', cropperModalKeydownHandler);
        };
        reader.readAsDataURL(files[0]);
    }
});

cropButton.addEventListener('click', async function() {
    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
    });
    canvas.toBlob(async function(blob) {
        try {
            const croppedImageId = await saveImageToIndexedDB(blob);
            const uncroppedBlob = await fetch(imageToCrop.src).then(res => res.blob());
            const uncroppedImageId = await saveImageToIndexedDB(uncroppedBlob);

            imageInput.dataset.croppedImageId = croppedImageId;
            imageInput.dataset.uncroppedImageId = uncroppedImageId;

            cropperModal.style.display = 'none';
            cropper.destroy();
            cropper = null;
            document.removeEventListener('keydown', cropperModalKeydownHandler);
        } catch (error) {
            console.error('Error saving images:', error);
        }
    });
});

closeBtn.onclick = function() {
    cropperModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    document.removeEventListener('keydown', cropperModalKeydownHandler);
};

window.onclick = function(event) {
    if (event.target == cropperModal) {
        cropperModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        document.removeEventListener('keydown', cropperModalKeydownHandler);
    }
};

closeFullImageBtn.onclick = function() {
    fullImageModal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == fullImageModal) {
        fullImageModal.style.display = 'none';
    }
};

document.getElementById('cat-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const color = document.getElementById('color').value;
    const gender = document.getElementById('gender').value;
    const where = document.getElementById('where').value;
    const city = document.getElementById('city').value;
    const birthdate = document.getElementById('birthdate').value;
    const age = document.getElementById('age').value;
    const uncertainAge = document.getElementById('uncertain-age').checked;
    const status = document.getElementById('status').value;
    const date = document.getElementById('date').value;
    const adoptedDate = document.getElementById('adopted-date').value;
    const newOwner = document.getElementById('new-owner').value;
    const notes = document.getElementById('notes').value;
    const catIndex = document.getElementById('cat-index').value;
    const croppedImageId = imageInput.dataset.croppedImageId || null;
    const uncroppedImageId = imageInput.dataset.uncroppedImageId || null;
    let finalBirthdate = birthdate;

    if (!birthdate && !age) {
        alert('Either Birthdate or Age is required');
        return;
    }

    if (age) {
        const currentYear = new Date().getFullYear();
        finalBirthdate = `${currentYear - age}-01-01`;
    }

    const cat = new Cat(name, color, gender, where, city, finalBirthdate, status, date, adoptedDate, newOwner, croppedImageId, uncroppedImageId, notes, age, uncertainAge);
    if (catIndex) {
        updateCat(parseInt(catIndex), cat);
    } else {
        saveCat(cat);
    }
    displayAllCats();
    resetForm();
});

document.getElementById('status').addEventListener('change', function(event) {
    const status = event.target.value;
    const deceasedInfo = document.getElementById('deceased-info');
    const locationContainer = document.getElementById('location-container');
    const adoptedInfo = document.getElementById('adopted-info');
    const whereInput = document.getElementById('where');
    const cityInput = document.getElementById('city');

    if (status === 'Avdød') {
        deceasedInfo.style.display = 'block';
        document.getElementById('date').required = true;
    } else {
        deceasedInfo.style.display = 'none';
        document.getElementById('date').required = false;
        document.getElementById('date').value = '';
    }

    if (status === 'Adoptert') {
        adoptedInfo.style.display = 'block';
        document.getElementById('adopted-date').required = true;
        document.getElementById('new-owner').required = true;
    } else {
        adoptedInfo.style.display = 'none';
        document.getElementById('adopted-date').required = false;
        document.getElementById('new-owner').required = false;
        document.getElementById('adopted-date').value = '';
        document.getElementById('new-owner').value = '';
    }

    if (status === 'Fjernadopsjon' || status === 'Adoptert' || status === 'Avdød') {
        locationContainer.style.display = 'none';
        whereInput.required = false;
        cityInput.required = false;
    } else {
        locationContainer.style.display = 'block';
        whereInput.required = true;
        if (whereInput.value === 'Fosterhjem') {
            cityInput.required = true;
            document.getElementById('city-container').style.display = 'block';
        } else {
            cityInput.required = false;
            document.getElementById('city-container').style.display = 'none';
        }
    }
});

document.getElementById('where').addEventListener('change', function(event) {
    const cityContainer = document.getElementById('city-container');
    const cityInput = document.getElementById('city');

    if (event.target.value === 'Fosterhjem') {
        cityContainer.style.display = 'block';
        cityInput.required = true;
    } else {
        cityContainer.style.display = 'none';
        cityInput.required = false;
        cityInput.value = '';
    }
});

document.getElementById('sort').addEventListener('change', displayAllCats);
document.getElementById('filter-status').addEventListener('change', displayAllCats);
document.getElementById('filter-male').addEventListener('change', displayAllCats);
document.getElementById('filter-female').addEventListener('change', displayAllCats);
document.getElementById('search-name').addEventListener('input', displayAllCats);

document.getElementById('notes').addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        const notesField = event.target;
        const start = notesField.selectionStart;
        const end = notesField.selectionEnd;
        notesField.value = notesField.value.substring(0, start) + '\n' + notesField.value.substring(end);
        notesField.selectionStart = notesField.selectionEnd = start + 1;
    }
});

document.getElementById('birthdate').addEventListener('change', function(event) {
    const birthdate = event.target.value;
    const ageInput = document.getElementById('age');

    if (birthdate) {
        const birthYear = new Date(birthdate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        ageInput.value = age;
    }
});

document.getElementById('age').addEventListener('change', function(event) {
    const age = event.target.value;
    const birthdateInput = document.getElementById('birthdate');

    if (age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - age;
        birthdateInput.value = `${birthYear}-01-01`;
    }
});

function saveCat(cat) {
    const cats = getCats();
    cats.push(cat);
    try {
        localStorage.setItem('cats', JSON.stringify(cats));
    } catch (e) {
        alert('Failed to save data: ' + e);
    }
}

function getCats() {
    const cats = localStorage.getItem('cats');
    return cats ? JSON.parse(cats) : [];
}

function updateCat(index, cat) {
    const cats = getCats();

    // Preserve the existing image if no new image is uploaded
    if (!imageInput.dataset.croppedImageId) {
        cat.croppedImageId = cats[index].croppedImageId;
        cat.uncroppedImageId = cats[index].uncroppedImageId;
    }

    cats[index] = cat;
    try {
        localStorage.setItem('cats', JSON.stringify(cats));
    } catch (e) {
        alert('Failed to update data: ' + e);
    }
}

function deleteCat(index) {
    const cats = getCats();
    const deletedCat = cats.splice(index, 1)[0];
    try {
        localStorage.setItem('cats', JSON.stringify(cats));
    } catch (e) {
        alert('Failed to delete data: ' + e);
    }
    
    deletedCat.deletedAt = new Date().getTime();
    
    if (deletedCatsStack.length >= 5) {
        deletedCatsStack.shift();
    }
    deletedCatsStack.push(deletedCat);
    displayAllCats();
}

async function displayCat(cat, index, originalIndex, container) {
    const catElement = document.createElement('div');
    catElement.classList.add('cat-element');

    const croppedImageUrl = await getImageFromIndexedDB(cat.croppedImageId);
    const uncroppedImageUrl = await getImageFromIndexedDB(cat.uncroppedImageId);

    let age = cat.age;
    if (cat.birthdate) {
        let birthdate = new Date(cat.birthdate);
        let comparisonDate = cat.status === 'Avdød' && cat.date ? new Date(cat.date) : new Date();
        let ageInMonths = (comparisonDate.getFullYear() - birthdate.getFullYear()) * 12 + (comparisonDate.getMonth() - birthdate.getMonth());

        if (ageInMonths < 12) {
            age = `${ageInMonths} months`;
        } else {
            age = `${Math.floor(ageInMonths / 12)} years`;
        }
    }

    catElement.innerHTML = `
        <h2>${cat.name}</h2>
        <p>Alder: ${age}</p>
        <p>Farge: ${cat.color}</p>
        <p>Kjønn: ${cat.gender}</p>
        ${cat.status !== 'Adoptert' && cat.status !== 'Fjernadopsjon' && cat.status !== 'Avdød' ? `<p>Hvor: ${cat.where}${cat.where === 'Fosterhjem' ? ', ' + cat.city : ''}</p>` : ''}
        <p>Fødsels dato: <span ${cat.uncertainAge ? 'style="color: red;"' : ''}>${cat.birthdate}</span></p>
        <p>Status: ${cat.status}</p>
        ${cat.status === 'Avdød' ? `<p>Død dato: ${cat.date}</p>` : ''}
        ${cat.status === 'Adoptert' ? `<p>Adoptert dato: ${cat.adoptedDate}</p><p>Ny Eier: ${cat.newOwner}</p>` : ''}
        <img src="${croppedImageUrl}" alt="${cat.name}" class="cropped-image" data-uncropped-image-id="${cat.uncroppedImageId}">
        ${cat.notes ? `<p>${cat.notes.replace(/\n/g, '<br>')}</p>` : ''}
        <button class="edit-button" data-index="${originalIndex}">Edit</button>
        <button class="delete-button" data-index="${originalIndex}">Delete</button>
    `;
    catElement.querySelector('.edit-button').addEventListener('click', () => editCat(originalIndex));
    catElement.querySelector('.delete-button').addEventListener('click', () => deleteCat(originalIndex));
    catElement.querySelector('.cropped-image').addEventListener('click', async function() {
        const uncroppedImageUrl = await getImageFromIndexedDB(parseInt(this.dataset.uncroppedImageId));
        fullImage.src = uncroppedImageUrl;
        fullImageModal.style.display = 'block';
    });
    container.appendChild(catElement);
}

async function displayAllCats() {
    const catDisplay = document.getElementById('cat-display');
    const adoptedCatDisplay = document.getElementById('adopted-cat-display');
    const deceasedCatDisplay = document.getElementById('deceased-cat-display');
    const remoteAdoptionCatDisplay = document.getElementById('remote-adoption-cat-display');
    
    catDisplay.innerHTML = '';
    adoptedCatDisplay.innerHTML = '';
    deceasedCatDisplay.innerHTML = '';
    remoteAdoptionCatDisplay.innerHTML = '';
    
    let cats = getCats();
    const sortOption = document.getElementById('sort').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterMale = document.getElementById('filter-male').checked;
    const filterFemale = document.getElementById('filter-female').checked;
    const searchName = document.getElementById('search-name').value.toLowerCase();

    let filteredCats = cats.map((cat, index) => ({ cat, originalIndex: index }))
        .filter(({ cat }) => (!filterStatus || cat.status === filterStatus)
            && (!filterMale || cat.gender === 'Gutt')
            && (!filterFemale || cat.gender === 'Jente')
            && (!searchName || cat.name.toLowerCase().includes(searchName)));

    let adoptedCats = filteredCats.filter(({ cat }) => cat.status === 'Adoptert');
    adoptedCats.sort((a, b) => new Date(b.cat.adoptedDate) - new Date(a.cat.adoptedDate));

    // Group adopted cats by year
    const adoptedCatsByYear = adoptedCats.reduce((acc, { cat, originalIndex }) => {
        const year = new Date(cat.adoptedDate).getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push({ cat, originalIndex });
        return acc;
    }, {});

    // Sort years in descending order
    const years = Object.keys(adoptedCatsByYear).sort((a, b) => b - a);

    // Display adopted cats grouped by year
    years.forEach(year => {
        const yearHeader = document.createElement('h3');
        yearHeader.textContent = `${year} (${adoptedCatsByYear[year].length} cats adopted)`;
        adoptedCatDisplay.appendChild(yearHeader);

        const yearContainer = document.createElement('div');
        yearContainer.classList.add('year-container');
        adoptedCatsByYear[year].forEach(({ cat, originalIndex }) => displayCat(cat, originalIndex, originalIndex, yearContainer));
        adoptedCatDisplay.appendChild(yearContainer);
    });

    let deceasedCats = filteredCats.filter(({ cat }) => cat.status === 'Avdød');
    deceasedCats.sort((a, b) => new Date(b.cat.date) - new Date(a.cat.date));
    deceasedCats.forEach(({ cat, originalIndex }) => displayCat(cat, originalIndex, originalIndex, deceasedCatDisplay));

    let remoteAdoptionCats = filteredCats.filter(({ cat }) => cat.status === 'Fjernadopsjon');
    remoteAdoptionCats.sort((a, b) => new Date(a.cat.birthdate) - new Date(b.cat.birthdate));
    remoteAdoptionCats.forEach(({ cat, originalIndex }) => displayCat(cat, originalIndex, originalIndex, remoteAdoptionCatDisplay));

    filteredCats = filteredCats.filter(({ cat }) => cat.status !== 'Adoptert' && cat.status !== 'Avdød' && cat.status !== 'Fjernadopsjon');
    filteredCats.sort((a, b) => {
        if (sortOption === 'name') {
            return a.cat.name.localeCompare(b.cat.name);
        } else if (sortOption === 'birthdate') {
            return new Date(a.cat.birthdate) - new Date(b.cat.birthdate);
        }
    });

    for (const { cat, originalIndex } of filteredCats) {
        await displayCat(cat, originalIndex, originalIndex, catDisplay);
    }
}

async function editCat(index) {
    const cats = getCats();
    const cat = cats[index];
    document.getElementById('name').value = cat.name;
    document.getElementById('color').value = cat.color;
    document.getElementById('gender').value = cat.gender;
    document.getElementById('where').value = cat.where;
    document.getElementById('city').value = cat.city;
    document.getElementById('birthdate').value = cat.birthdate;

    // Calculate age from birthdate
    if (cat.birthdate) {
        const birthYear = new Date(cat.birthdate).getFullYear();
        const currentYear = new Date().getFullYear();
        document.getElementById('age').value = currentYear - birthYear;
    } else {
        document.getElementById('age').value = cat.age;
    }

    document.getElementById('uncertain-age').checked = cat.uncertainAge;
    document.getElementById('status').value = cat.status;
    document.getElementById('date').value = cat.date;
    document.getElementById('adopted-date').value = cat.adoptedDate;
    document.getElementById('new-owner').value = cat.newOwner;
    document.getElementById('notes').value = cat.notes;
    document.getElementById('cat-index').value = index;

    // Load images from IndexedDB
    const croppedImageUrl = await getImageFromIndexedDB(cat.croppedImageId);
    const uncroppedImageUrl = await getImageFromIndexedDB(cat.uncroppedImageId);
    imageInput.dataset.croppedImageId = cat.croppedImageId;
    imageInput.dataset.uncroppedImageId = cat.uncroppedImageId;

    document.getElementById('edit-indicator').style.display = 'block';
    document.getElementById('edit-cat-name').textContent = cat.name;
    document.getElementById('submit-button').textContent = 'Update Cat';

    if (cat.status !== 'Adoptert' && cat.status !== 'Fjernadopsjon' && cat.status !== 'Avdød') {
        document.getElementById('location-container').style.display = 'block';
        document.getElementById('where').required = true;
        if (cat.where === 'Fosterhjem') {
            document.getElementById('city-container').style.display = 'block';
            document.getElementById('city').required = true;
        } else {
            document.getElementById('city-container').style.display = 'none';
            document.getElementById('city').required = false;
        }
    } else {
        document.getElementById('location-container').style.display = 'none';
        document.getElementById('where').required = false;
        document.getElementById('city-container').style.display = 'none';
        document.getElementById('city').required = false;
    }

    if (cat.status === 'Avdød') {
        document.getElementById('deceased-info').style.display = 'block';
        document.getElementById('date').required = true;
    } else {
        document.getElementById('deceased-info').style.display = 'none';
        document.getElementById('date').required = false;
    }

    if (cat.status === 'Adoptert') {
        document.getElementById('adopted-info').style.display = 'block';
        document.getElementById('adopted-date').required = true;
        document.getElementById('new-owner').required = true;
    } else {
        document.getElementById('adopted-info').style.display = 'none';
        document.getElementById('adopted-date').required = false;
        document.getElementById('new-owner').required = false;
    }
}

function resetForm() {
    document.getElementById('cat-form').reset();
    document.getElementById('cat-index').value = '';
    document.getElementById('location-container').style.display = 'none';
    document.getElementById('city-container').style.display = 'none';
    document.getElementById('city').required = false;
    document.getElementById('deceased-info').style.display = 'none';
    document.getElementById('adopted-info').style.display = 'none';
    document.getElementById('date').required = false;
    document.getElementById('adopted-date').required = false;
    document.getElementById('new-owner').required = false;
    document.getElementById('edit-indicator').style.display = 'none';
    document.getElementById('submit-button').textContent = 'Submit';
}

function clearOldDeletedCats() {
    const threshold = 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    
    const updatedStack = deletedCatsStack.filter(cat => (currentTime - cat.deletedAt) < threshold);
    
    deletedCatsStack.length = 0;
    Array.prototype.push.apply(deletedCatsStack, updatedStack);
}

function cropperModalKeydownHandler(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        cropButton.click();
    }
}

setInterval(clearOldDeletedCats, 60 * 60 * 1000);

window.onload = async function() {
    await migrateImagesToIndexedDB();
    displayAllCats();

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'z') {
            if (deletedCatsStack.length > 0) {
                const restoredCat = deletedCatsStack.pop();
                saveCat(restoredCat);
                displayAllCats();
            }
        }
    });
};
