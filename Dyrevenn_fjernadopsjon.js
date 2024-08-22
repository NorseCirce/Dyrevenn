document.addEventListener("DOMContentLoaded", function() {
    var kontaktOssImage = document.getElementById('kontakt-oss-image');
    var kontaktOss = document.getElementById('kontakt-oss');
    var wrapper = document.querySelector('.wrapper');

    function adjustImageHeight() {
        var kontaktOssHeight = kontaktOss.offsetHeight;
        kontaktOssImage.style.height = (kontaktOssHeight * 0.85) + 'px';
    }

    function updateMaxBottom() {
        if (window.innerWidth < 600) {
            wrapper.setAttribute('data-max-bottom', '0.1');
        } else {
            wrapper.setAttribute('data-max-bottom', '0.2');
        }
    }

    // Initial adjustments
    adjustImageHeight();
    updateMaxBottom();

    // Adjust on window resize
    window.addEventListener('resize', function() {
        adjustImageHeight();
        updateMaxBottom();
    });
});







//Cats for fjernadopsjon

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
    console.log('Retrieved cats from localStorage:', cats);
    return cats ? JSON.parse(cats) : [];
}

function calculateAge(birthdate) {
    const birthDate = new Date(birthdate);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async function populateCatOptions() {
    const select = document.getElementById('katt');
    const cats = await getCats();
    const fjernadopsjonCats = cats.filter(cat => cat.status === 'Fjernadopsjon');
    
    fjernadopsjonCats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

async function displayCat(cat) {
    const catDisplay = document.getElementById('cat-display');
    const catElement = document.createElement('div');
    catElement.classList.add('cat-element');
    
    // Get the image from IndexedDB
    const imageUrl = await getImageFromIndexedDB(cat.croppedImageId);
    console.log('Image URL for cat', cat.name, ':', imageUrl);
    
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

async function displayAllCats() {
    const catDisplay = document.getElementById('cat-display');
    catDisplay.innerHTML = '';
    const cats = await getCats();
    console.log('Displaying cats:', cats);
    const fjernadopsjonCats = cats.filter(cat => cat.status === 'Fjernadopsjon');

    for (const cat of fjernadopsjonCats) {
        await displayCat(cat);
    }
}

async function showCatDetails(cat) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const age = calculateAge(cat.birthdate);

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
                <p>Alder: ${age} år</p>
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

window.onload = async function() {
    await displayAllCats();
    await populateCatOptions();
};

// Send forespørsel
function sendEmail() {
    var form = document.getElementById('contact-form');
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'Dyrevenn_fjernadopsjon.php', true);

    xhr.onload = function () {
        var result = document.getElementById('form-result');
        if (xhr.status === 200) {
            result.innerHTML = xhr.responseText;
        } else {
            result.innerHTML = 'Noe gikk galt, vennligst prøv igjen senere.';
        }
    };

    xhr.onerror = function () {
        var result = document.getElementById('form-result');
        result.innerHTML = 'Noe gikk galt, vennligst prøv igjen senere.';
    };

    xhr.send(formData);
}
