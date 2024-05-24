document.addEventListener("DOMContentLoaded", function () {
    const bookSubmit = document.getElementById("bookSubmit");
    const searchSubmit = document.getElementById("searchSubmit");
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");
    const editBookModal = document.getElementById("editBookModal");
    const editBookForm = document.getElementById("editBookForm");
    const closeModalButton = document.querySelector(".close");

    bookSubmit.addEventListener("click", function (event) {
        event.preventDefault();
        addBook();
    });

    searchSubmit.addEventListener("click", function (event) {
        event.preventDefault();
        const searchTerm = document.getElementById("searchBookTitle").value.toLowerCase();
        searchBooks(searchTerm);
    });

    editBookForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const bookId = parseInt(document.getElementById("editBookId").value);
        updateBook(bookId);
    });

    closeModalButton.addEventListener("click", function () {
        closeModal(editBookModal);
    });

    function addBook() {
        const bookTitle = document.getElementById("inputBookTitle").value;
        const bookAuthor = document.getElementById("inputBookAuthor").value;
        const bookYear = parseInt(document.getElementById("inputBookYear").value);
        const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

        if (bookTitle && bookAuthor && bookYear) {
            const newBook = makeBook(bookTitle, bookAuthor, bookYear, bookIsComplete);
            books.push(newBook);
            updateDataToStorage();
            refreshBookList();
        } else {
            alert("Semua field harus diisi!");
        }
    }

    function addBookToCompleted(bookObject) {
        const bookItem = createBookItem(bookObject.title, bookObject.author, bookObject.year);
        bookItem.setAttribute("data-book-id", bookObject.id);

        const action = createBookActions(bookObject.id, true);
        bookItem.append(action);
        completeBookshelfList.append(bookItem);
    }

    function addBookToUncompleted(bookObject) {
        const bookItem = createBookItem(bookObject.title, bookObject.author, bookObject.year);
        bookItem.setAttribute("data-book-id", bookObject.id);

        const action = createBookActions(bookObject.id, false);
        bookItem.append(action);
        incompleteBookshelfList.append(bookItem);
    }

    function createBookItem(title, author, year) {
        const bookItem = document.createElement("article");
        bookItem.classList.add("book_item");

        const bookTitle = document.createElement("h3");
        bookTitle.innerText = title;

        const bookAuthor = document.createElement("p");
        bookAuthor.innerText = `Penulis: ${author}`;

        const bookYear = document.createElement("p");
        bookYear.innerText = `Tahun: ${year}`;

        bookItem.append(bookTitle, bookAuthor, bookYear);
        return bookItem;
    }

    function createBookActions(bookId, isComplete) { // Perubahan di sini
        const action = document.createElement("div");
        action.classList.add("action");

        const toggleButton = document.createElement("button");
        toggleButton.classList.add("green");
        toggleButton.innerHTML = isComplete ? "Belum selesai di Baca" : "Selesai dibaca";
        toggleButton.addEventListener("click", function () {
            isComplete ? undoCompletedBook(bookId) : completedBook(bookId);
        });
        action.append(toggleButton);

        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.innerHTML = "Hapus buku";
        trashButton.addEventListener("click", function () {
            showDeleteConfirmation(bookId);
        });
        action.append(trashButton);

        const editButton = document.createElement("button");
        editButton.innerHTML = "Edit buku";
        editButton.addEventListener("click", function () {
            showEditForm(bookId);
        });
        action.append(editButton);

        return action;
    }

    function makeBook(title, author, year, isComplete) { // Perubahan di sini
        return {
            id: +new Date(),
            title,
            author,
            year,
            isComplete,
        };
    }

    function completedBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex !== -1) {
            books[bookIndex].isComplete = true; // Perubahan di sini
            updateDataToStorage();
            refreshBookList();
        }
    }

    function undoCompletedBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex !== -1) {
            books[bookIndex].isComplete = false; // Perubahan di sini
            updateDataToStorage();
            refreshBookList();
        }
    }

    function removeBook(bookId) {
        books = books.filter((book) => book.id !== bookId);
        updateDataToStorage();
        refreshBookList();
    }

    function updateBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex !== -1) {
            books[bookIndex] = {
                id: bookId,
                title: document.getElementById("editBookTitleInput").value,
                author: document.getElementById("editBookAuthor").value,
                year: parseInt(document.getElementById("editBookYear").value),
                isComplete: books[bookIndex].isComplete, // Perubahan di sini
            };
            updateDataToStorage();
            refreshBookList();
            closeModal(editBookModal);
        }
    }

    function searchBooks(searchTerm) {
        const filteredBooks = books.filter((book) =>
            book.title.toLowerCase().includes(searchTerm)
        );
        refreshBookList(filteredBooks);
    }

    function findBookIndex(bookId) {
        return books.findIndex((book) => book.id === bookId);
    }

    function showDeleteConfirmation(bookId) {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
            removeBook(bookId);
        }
    }

    function showEditForm(bookId) {
        const book = books.find((book) => book.id === bookId);
        if (book) {
            document.getElementById("editBookId").value = book.id;
            document.getElementById("editBookTitleInput").value = book.title;
            document.getElementById("editBookAuthor").value = book.author;
            document.getElementById("editBookYear").value = book.year;
            openModal(editBookModal);
        }
    }

    function refreshBookList(filteredBooks = books) {
        incompleteBookshelfList.innerHTML = "";
        completeBookshelfList.innerHTML = "";

        for (const book of filteredBooks) {
            if (book.isComplete) { // Perubahan di sini
                addBookToCompleted(book);
            } else {
                addBookToUncompleted(book);
            }
        }
    }

    function openModal(modal) {
        modal.style.display = "block";
    }

    function closeModal(modal) {
        modal.style.display = "none";
    }

    // Local Storage
    let books = [];

    function isStorageExist() {
        if (typeof Storage === "undefined") {
            alert("Browser kamu tidak mendukung local storage");
            return false;
        }
        return true;
    }

    function updateDataToStorage() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem("books", parsed);
        }
    }

    function getDataFromStorage() {
        const data = localStorage.getItem("books");
        try {
            if (data) {
                books = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error parsing data from storage:", error);
        }
    }

    if (isStorageExist()) {
        getDataFromStorage();
        refreshBookList();
    }
});