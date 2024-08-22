document.addEventListener("DOMContentLoaded", function() {
    const additionalImages = [
        "Images/90515596_2308070186157058_280379184524558336_n.jpg",
        "Images/301441225_443405197822527_6165597121977666213_n.jpg",
        "Images/301593917_443405301155850_3595791841878120394_n.jpg",
        "Images/0b517db01d402d2dbb8bdc5ba20d56ab_fit.jpg",
        "Images/438707526_831725048990538_685728034226704717_n.jpg",
        "Images/301874987_443405071155873_8898775647151775661_n.jpg",
        "Images/438828657_831724722323904_6298809636602290562_n.jpg",
        "Images/438095743_831725175657192_4837036773084460706_n.jpg"
    ];

    const images = document.querySelectorAll('.wave-img');
    let currentIndexes = [0, 1, 2];
    let nextImageIndex = 3;

    // Function to check if an image exists
    function imageExists(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    // Function to set the active images
    async function setActiveImages(imgElements, indexes) {
        for (let i = 0; i < imgElements.length; i++) {
            let imgUrl = additionalImages[indexes[i] % additionalImages.length];
            const exists = await imageExists(imgUrl);
            if (exists) {
                imgElements[i].src = imgUrl;
            }
        }
    }

    // Initial active images
    setActiveImages(images, currentIndexes);

    // Wave effect
    async function waveChange(index) {
        images[index].classList.add('hidden');
        setTimeout(async () => {
            let newIndex;
            let imgUrl;
            let exists = false;
            do {
                newIndex = nextImageIndex % additionalImages.length;
                imgUrl = additionalImages[newIndex];
                exists = await imageExists(imgUrl);
                nextImageIndex++;
            } while (!exists || currentIndexes.includes(newIndex));

            currentIndexes[index] = newIndex;
            images[index].src = imgUrl;
            images[index].classList.remove('hidden');

            // Schedule the next change for the next image
            setTimeout(() => {
                waveChange((index + 1) % images.length);
            }, 5000); // 5 seconds after this change
        }, 1000); // Time for the opacity transition to complete
    }

    // Start the wave effect with the first image change
    setTimeout(() => {
        waveChange(0);
    }, 5000); // Start the first change after 5 seconds
});