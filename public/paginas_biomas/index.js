document.addEventListener("DOMContentLoaded", function () {
    // Get the current page name from the URL
    const currentPage = window.location.pathname.split('/').pop().split('.')[0].toLowerCase();
    
    // Define image arrays for each biome
    const imageCollections = {
        "amazônia": [
            "imagem/Amazonia_1.png",
            "imagem/Amazonia_2.jpg",
            "imagem/Amazonia_3.jpg",
            "imagem/Amazonia_4.jpg",
        ],
        "caatinga": [
            "imagem/caatinga1.jpg",
            "imagem/caatinga2.jpg",
            "imagem/caatinga3.jpg"
        ],
        "cerrado": [
            "imagem/cerrado1.jpg",
            "imagem/cerrado2.jpg",
            "imagem/cerrado3.jpg"
        ],
        "mata atlântica": [
            "imagem/mata-atlantica1.jpg",
            "imagem/mata-atlantica2.jpeg",
            "imagem/mata-atlantica3.jpg"
        ],
        "pantanal": [
            "imagem/pantanal1.webp",
            "imagem/pantanal2.webp",
            "imagem/pantanal3.webp"
        ],
        "pampa": [
            "imagem/pampa1.jpg",
            "imagem/pampa2.jpeg",
            "imagem/pampa3.webp"
        ]
    };
    
    // IDs dos vídeos do YouTube para cada bioma
    const youtubeVideos = {
        "amazônia": "q_VhGh-ZA0k", 
        "caatinga": "xjRWPFhxzlA", 
        "cerrado": "zg2xnELQ6H0", 
        "mata atlântica": "LcbAs7HlAJk", 
        "pantanal": "-ff0lXpkfsU", 
        "pampa": "At-1KfyUwBo"  
    };
    
    
    let images = imageCollections["amazônia"];  // Padrão
    let videoId = youtubeVideos["amazônia"];    // Vídeo padrão
    

    for (const biome in imageCollections) {
        if (currentPage.includes(biome.toLowerCase().replace(/\s+/g, ''))) {
            images = imageCollections[biome];
            videoId = youtubeVideos[biome];
            break;
        }
    }

    // Funcionalidade da galeria de imagens
    let index = 0;
    let imgElement = document.getElementById("galleria_Imagem");
    
    // Define a imagem inicial se o elemento existir
    if (imgElement) {
        imgElement.src = images[index];
    }

    function changeImage(direction) {
        index += direction;
        if (index < 0) {
            index = images.length - 1;
        } else if (index >= images.length) {
            index = 0;
        }
        if (imgElement) {
            imgElement.src = images[index];
        }
    }

    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    
    if (prevButton) {
        prevButton.addEventListener("click", function () {
            changeImage(-1);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener("click", function () {
            changeImage(1);
        });
    }
    
    // Define o vídeo do YouTube
    const videoFrame = document.getElementById("biome-video");
    if (videoFrame) {
        videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
    }
});