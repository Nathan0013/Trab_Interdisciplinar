document.addEventListener("DOMContentLoaded", function () {
    let images = [
        "imagens/2024.06.23-22.24.00.png",
        "imagens/Exercicio1_web.PNG",
        "imagens/amazonia3.jpg"
    ]; 

    let index = 0;
    let imgElement = document.getElementById("galleria_Imagem");

    function changeImage(direction) {
        index += direction;
        if (index < 0) {
            index = images.length - 1;
        } else if (index >= images.length) {
            index = 0;
        }
        imgElement.src = images[index];
    }

    document.getElementById("prev").addEventListener("click", function () {
        changeImage(-1);
    });

    document.getElementById("next").addEventListener("click", function () {
        changeImage(1);
    });
});
