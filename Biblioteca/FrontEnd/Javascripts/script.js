const booklist = document.querySelector('.book-list');

async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/gaBook');
        if (!response.ok) {
            throw new Error('Error al obtener los libros');
        }
        const data = await response.json();
        data.forEach(book => {
            const bookCard = createBookCard(book);
            booklist.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function removeChar(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "");
}

function createBookCard(book) {
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card-container');

    const card = document.createElement('div');
    card.classList.add('book-card');

    //contenido frontal
    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');

    const image = document.createElement('img');
    image.src = `../../portadasLibros/${book.imagenUrl}`;
    image.alt = 'Portada del libro';
    image.width = 198;
    image.height = 300;

    //contenido trasero
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    const sinopsis = document.createElement('h3');
    sinopsis.textContent = 'Sinopsis.';
    sinopsis.style.textAlign = 'center';
    const descripcion = document.createElement('p');
    descripcion.textContent = `${book.descripcion}`;

    //agregar cards
    //frontal
    cardFront.appendChild(image);
    //trasera
    cardBack.appendChild(sinopsis);
    cardBack.appendChild(descripcion);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info');
    const title = document.createElement('h2');
    title.textContent = book.titulo;

    const author = document.createElement('p');
    author.textContent = `Autor: ${book.autor}`;

    const toBook = document.createElement('a');
    toBook.href = `../../pdfLibros/${removeChar(book.titulo)}.pdf`.toLowerCase();
    toBook.textContent = 'Leer en linea';
    toBook.target = '_blank';

    cardInfo.classList.add('card-info');
    cardInfo.appendChild(title);
    cardInfo.appendChild(author);
    cardInfo.appendChild(toBook);


    cardContainer.appendChild(card);
    cardContainer.append(cardInfo);
    return cardContainer;
}

fetchBooks();

