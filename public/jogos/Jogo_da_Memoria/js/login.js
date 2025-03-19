const input = document.querySelector('.login__input')
const button = document.querySelector('.login__button')
const form = document.querySelector('.login-form')

const validarInput = ({target}) => {
    if(target.value.length > 2) {
        button.removeAttribute('disabled')
        return;
}
button.setAttribute('disabled', '')
}


const handleSubmit = (event) => {
    event.preventDefault();
    
    localStorage.setItem('jogador', input.value);
    window.location='pages/game.html'
}

input.addEventListener('input', validarInput)
form.addEventListener('submit', handleSubmit)


