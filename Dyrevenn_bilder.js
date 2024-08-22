const imageFolderPath = 'Images/Fjernadopsjon/'; // Path to your image folder
let currentIndex = 1; // Start index of the first image
let totalImages = 0; // Total number of images (will be determined dynamically)

const imgElement = document.getElementById('catImage');

function preloadImages() {
  // Simulate fetching list of images from server
  fetchImageList().then(imageList => {
    totalImages = imageList.length;
    preload(imageList);
  }).catch(error => {
    console.error('Failed to fetch image list:', error);
  });
}

function fetchImageList() {
  // Simulate fetching list of image names from server or directory
  // Replace with actual API call or server-side logic to get image list
  return new Promise((resolve, reject) => {
    // Simulating fetching list of images with a delay
    setTimeout(() => {
      const imageList = [];
      // Assuming images are named image_1.jpg, image_2.jpg, etc.
      let i = 1;
      while (true) {
        const imagePath = `${imageFolderPath}image_${i}.jpg`;
        // Check if image exists (simulate existence)
        if (imageExists(imagePath)) {
          imageList.push(imagePath);
          i++;
        } else {
          break;
        }
      }
      resolve(imageList);
    }, 1000); // Simulate delay for fetching image list
  });
}

function imageExists(imagePath) {
  // Simulate checking if image exists (replace with actual logic if needed)
  // Here we are simulating that all images exist
  return true;
}

function preload(imageList) {
  // Preload images using JavaScript's Image object
  imageList.forEach(imagePath => {
    const img = new Image();
    img.src = imagePath;
  });
}

function changeImage() {
  currentIndex = (currentIndex % totalImages) + 1; // Increment index (1 to totalImages)
  imgElement.src = `${imageFolderPath}image_${currentIndex}.jpg`;
}

// Preload images and start image rotation
preloadImages();
setInterval(changeImage, 15000); // Change image every 15 seconds
