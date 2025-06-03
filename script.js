document.addEventListener('DOMContentLoaded', () => {
    let books = [];
    let editingBookId = null;

    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    const bookForm = document.getElementById('bookForm');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const imageUrlInput = document.getElementById('imageUrl');
    const summaryTextarea = document.getElementById('summary');
    const ratingInput = document.getElementById('rating');
    const ratingStarsContainer = document.getElementById('ratingStars');
    const personalCommentTextarea = document.getElementById('personalComment');
    const quoteTextarea = document.getElementById('quote');
    const submitButton = document.getElementById('submitButton');
    const bookList = document.getElementById('bookList');
    const noBooksMessage = document.getElementById('noBooksMessage');
    const formTitle = document.getElementById('formTitle');

    const messageBox = document.getElementById('messageBox');
    const messageBoxContent = document.getElementById('messageBoxContent');

    const formViewContainer = document.getElementById('formViewContainer');
    const inventoryViewContainer = document.getElementById('inventoryViewContainer');
    const showFormBtn = document.getElementById('showFormBtn');
    const showInventoryBtn = document.getElementById('showInventoryBtn');

    const themes = {
        light: {
            icon: '<i class="fa-solid fa-moon text-xl"></i>',
            vars: {
                '--text-muted-color': '#4b5563',
                '--placeholder-color': '#9ca3af',
                '--input-bg-color': '#ffffff',
                '--input-border-color': '#d1d5db',
                '--input-text-color': '#1f2937',
                '--input-focus-border-color': '#2563eb',
                '--input-focus-ring-color-with-opacity': 'rgba(37, 99, 235, 0.3)',
                '--star-active-color': '#f59e0b',
                '--nav-button-text-color': '#374151',
                '--nav-button-bg-color': 'transparent',
                '--nav-button-hover-bg-color': 'rgba(229, 231, 235, 0.7)',
                '--nav-button-active-bg-color': '#2563eb',
                '--nav-button-active-text-color': '#ffffff',
                '--nav-active-shadow-color': 'rgba(37, 99, 235, 0.25)',
                '--scrollbar-track-bg': '#e5e7eb',
                '--scrollbar-thumb-bg': '#9ca3af',
                '--scrollbar-thumb-hover-bg': '#6b7280',
                '--tooltip-bg-color': '#1f2937',
                '--tooltip-text-color': '#ffffff',
            }
        },
        dark: {
            icon: '<i class="fa-solid fa-sun text-xl"></i>',
            vars: {
                '--text-muted-color': '#94a3b8',
                '--placeholder-color': '#64748b',
                '--input-bg-color': '#1e293b',
                '--input-border-color': '#334155',
                '--input-text-color': '#e2e8f0',
                '--input-focus-border-color': '#7c3aed',
                '--input-focus-ring-color-with-opacity': 'rgba(124, 58, 237, 0.3)',
                '--star-active-color': '#facc15',
                '--nav-button-text-color': '#cbd5e1',
                '--nav-button-bg-color': 'transparent',
                '--nav-button-hover-bg-color': 'rgba(51, 65, 85, 0.7)',
                '--nav-button-active-bg-color': '#7c3aed',
                '--nav-button-active-text-color': '#ffffff',
                '--nav-active-shadow-color': 'rgba(124, 58, 237, 0.25)',
                '--scrollbar-track-bg': '#334155',
                '--scrollbar-thumb-bg': '#64748b',
                '--scrollbar-thumb-hover-bg': '#94a3b8',
                '--tooltip-bg-color': '#e2e8f0',
                '--tooltip-text-color': '#1e293b',
            }
        }
    };

    function applyTheme(themeName) {
        const themeConfig = themes[themeName];
        if (!themeConfig) return;

        if (themeName === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
        themeToggleBtn.innerHTML = themeConfig.icon;
        localStorage.setItem('theme', themeName);

        for (const [key, value] of Object.entries(themeConfig.vars)) {
            htmlElement.style.setProperty(key, value);
        }
        updateNavButtonStyles(themeName);
        updateStarColorsInForm(themeName);
        if (!formViewContainer.classList.contains('hidden') || !inventoryViewContainer.classList.contains('hidden')) {
             renderBooks(); 
        }
    }

    function updateNavButtonStyles(themeName, activeBtn) {
        const active = activeBtn || (formViewContainer.classList.contains('hidden') ? showInventoryBtn : showFormBtn);
        
        [showInventoryBtn, showFormBtn].forEach(btn => {
            btn.style.backgroundColor = themes[themeName].vars['--nav-button-bg-color'];
            btn.style.color = themes[themeName].vars['--nav-button-text-color'];
            btn.classList.remove('active');
            btn.onmouseenter = () => { if (btn !== active) btn.style.backgroundColor = themes[themeName].vars['--nav-button-hover-bg-color']; };
            btn.onmouseleave = () => { if (btn !== active) btn.style.backgroundColor = themes[themeName].vars['--nav-button-bg-color']; };
        });

        active.style.backgroundColor = themes[themeName].vars['--nav-button-active-bg-color'];
        active.style.color = themes[themeName].vars['--nav-button-active-text-color'];
        active.classList.add('active');
    }
    
    function updateStarColorsInForm(themeName) {
        const stars = ratingStarsContainer.querySelectorAll('.fa-star');
        const currentRating = parseInt(ratingInput.value, 10);
        const inactiveStarColor = themeName === 'dark' ? '#4b5563' : '#cbd5e1';
        stars.forEach((star, index) => {
            star.style.color = (index < currentRating) ? themes[themeName].vars['--star-active-color'] : inactiveStarColor;
        });
    }

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    function showView(viewToShow) {
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        const activeNavButton = viewToShow === 'form' ? showFormBtn : showInventoryBtn;

        formViewContainer.classList.toggle('hidden', viewToShow !== 'form');
        inventoryViewContainer.classList.toggle('hidden', viewToShow === 'form');
        
        updateNavButtonStyles(currentTheme, activeNavButton);

        if (viewToShow === 'form') {
            formTitle.textContent = editingBookId ? 'Editar Livro' : 'Adicionar Novo Livro';
            submitButton.textContent = editingBookId ? 'Salvar Edição' : 'Adicionar Livro';
            if (!editingBookId) {
                bookForm.reset();
                setRating(0);
            }
        } else {
            editingBookId = null;
        }
    }

    showFormBtn.addEventListener('click', () => showView('form'));
    showInventoryBtn.addEventListener('click', () => showView('inventory'));

    function showModalMessage(message) {
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        const themeColors = themes[currentTheme].vars;
        
        messageBoxContent.innerHTML = `
            <p id="messageTextEl" class="text-lg font-medium mb-5" style="color: ${themeColors['--text-color']}">${message}</p>
            <button id="messageBoxCloseEl" 
                    class="text-white py-2 px-5 rounded-md font-medium text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style="background-color: ${themeColors['--nav-button-active-bg-color']}; /* Usando a cor do botão ativo primário */
                           --tw-ring-color: ${themeColors['--input-focus-border-color']}; 
                           --tw-ring-offset-color: ${currentTheme === 'dark' ? '#1e293b' : '#ffffff'};"> 
                OK
            </button>`;
        const modalCloseBtn = document.getElementById('messageBoxCloseEl');
        modalCloseBtn.onmouseenter = () => modalCloseBtn.style.backgroundColor = themeColors['--nav-button-hover-bg-color']; // Usar cor de hover apropriada
        modalCloseBtn.onmouseleave = () => modalCloseBtn.style.backgroundColor = themeColors['--nav-button-active-bg-color'];
        modalCloseBtn.addEventListener('click', () => messageBox.classList.add('hidden'));
        messageBox.classList.remove('hidden');
    }
    
    function saveBooksToStorage() { localStorage.setItem('myDigitalLibraryBooks', JSON.stringify(books)); }
    function loadBooksFromStorage() {
        const storedBooks = localStorage.getItem('myDigitalLibraryBooks');
        books = storedBooks ? JSON.parse(storedBooks) : [];
    }

    function renderBooks() {
        bookList.innerHTML = '';
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        const themeVars = themes[currentTheme].vars;

        if (books.length === 0) {
            noBooksMessage.classList.remove('hidden');
        } else {
            noBooksMessage.classList.add('hidden');
            books.sort((a, b) => a.title.localeCompare(b.title));
            books.forEach(book => {
                const bookCard = document.createElement('div');
                bookCard.id = `book-${book.id}`;
                bookCard.className = `p-6 rounded-xl shadow-subtle dark:shadow-interactive-dark border 
                                    bg-light_surface dark:bg-dark_surface
                                    border-light_border/70 dark:border-dark_border/70
                                    hover:shadow-interactive dark:hover:shadow-interactive-dark
                                    transition-all duration-200 ease-in-out`;
                
                const placeholderImage = `https://placehold.co/128x192/${currentTheme === 'dark' ? '334155/94a3b8' : 'e5e7eb/4b5563'}?text=Capa&font=inter`;
                const sanitize = (str) => str ? String(str).replace(/</g, "<").replace(/>/g, ">") : '';

                bookCard.innerHTML = `
                    <div class="flex flex-col md:flex-row items-start md:space-x-6">
                        <div class="flex-shrink-0 w-24 h-36 md:w-32 md:h-48 rounded-lg overflow-hidden shadow-md mb-4 md:mb-0 border border-light_border/50 dark:border-dark_border/50">
                            <img src="${sanitize(book.imageUrl) || placeholderImage}" alt="Capa: ${sanitize(book.title)}"
                                class="w-full h-full object-cover"
                                onerror="this.onerror=null;this.src='${placeholderImage}';">
                        </div>
                        <div class="flex-grow w-full">
                            <h3 class="text-xl font-semibold mb-0.5 text-light_text dark:text-dark_text">${sanitize(book.title)}</h3>
                            <p class="text-sm mb-3 text-light_text_muted dark:text-dark_text_muted">
                                Por <span class="font-medium">${sanitize(book.author)}</span>
                            </p>
                            
                            <div class="mb-2.5 space-y-0.5">
                                <p class="text-xs font-medium uppercase tracking-wide text-light_text_muted dark:text-dark_text_muted opacity-80">Resumo</p>
                                <p class="text-sm leading-relaxed text-light_text dark:text-dark_text">${sanitize(book.summary)}</p>
                            </div>
                             <div class="mb-2.5">
                                <p class="text-xs font-medium uppercase tracking-wide text-light_text_muted dark:text-dark_text_muted opacity-80">Minha Nota</p>
                                <div class="star-rating text-lg flex">
                                    ${Array(5).fill(0).map((_, i) => `
                                        <i class="fa-solid fa-star mr-0.5" style="color: ${i < book.rating ? themeVars['--star-active-color'] : (currentTheme === 'dark' ? '#4b5563' : '#cbd5e1')};"></i>
                                    `).join('')}
                                </div>
                            </div>
                            ${book.personalComment ? `
                                <div class="mb-2.5 space-y-0.5">
                                    <p class="text-xs font-medium uppercase tracking-wide text-light_text_muted dark:text-dark_text_muted opacity-80">Comentário Pessoal</p>
                                    <p class="text-sm leading-relaxed text-light_text dark:text-dark_text">${sanitize(book.personalComment)}</p>
                                </div>
                            ` : ''}
                            ${book.quote ? `
                                <div class="mb-3 space-y-0.5">
                                    <p class="text-xs font-medium uppercase tracking-wide text-light_text_muted dark:text-dark_text_muted opacity-80">Citação Favorita</p>
                                    <p class="text-sm leading-relaxed italic border-l-2 pl-2.5 py-0.5 text-light_text dark:text-dark_text
                                              ${currentTheme === 'dark' ? 'border-dark_border' : 'border-light_border'}">
                                        ${sanitize(book.quote)}
                                    </p>
                                </div>
                            ` : ''}
                            <div class="flex space-x-2 justify-end mt-4 pt-3 border-t border-light_border/50 dark:border-dark_border/50">
                                <div class="icon-button-tooltip-container">
                                    <button data-id="${book.id}" aria-label="Editar livro" class="edit-btn action-icon-button text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500">
                                        <i class="fa-solid fa-pencil-alt fa-fw"></i>
                                    </button>
                                    <span class="tooltip-text">Editar</span>
                                </div>
                                <div class="icon-button-tooltip-container">
                                    <button data-id="${book.id}" aria-label="Excluir livro" class="delete-btn action-icon-button text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500">
                                        <i class="fa-solid fa-trash-alt fa-fw"></i>
                                    </button>
                                    <span class="tooltip-text">Excluir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                bookList.appendChild(bookCard);
            });

            document.querySelectorAll('.action-icon-button').forEach(button => {
                button.classList.add('p-2', 'rounded-full', 'transition-colors', 'duration-150', 'ease-in-out', 'hover:bg-opacity-20');
                if (htmlElement.classList.contains('dark')) {
                    button.classList.add('hover:bg-slate-700');
                } else {
                    button.classList.add('hover:bg-gray-200');
                }
            });

            document.querySelectorAll('.edit-btn').forEach(button => button.addEventListener('click', (e) => editBookHandler(e.currentTarget.dataset.id)));
            document.querySelectorAll('.delete-btn').forEach(button => button.addEventListener('click', (e) => deleteBookHandler(e.currentTarget.dataset.id)));
        }
    }

    function setRating(value) {
        ratingInput.value = value;
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        updateStarColorsInForm(currentTheme);
    }
    ratingStarsContainer.addEventListener('click', (event) => {
        const star = event.target.closest('.fa-star');
        if (star && star.dataset.value) {
            const newValue = parseInt(star.dataset.value, 10);
            const currentValue = parseInt(ratingInput.value, 10);
            if (newValue === currentValue && Array.from(ratingStarsContainer.querySelectorAll('.fa-star')).filter(s => s.style.color === themes[htmlElement.classList.contains('dark') ? 'dark' : 'light'].vars['--star-active-color']).length === newValue) {
                setRating(newValue - 1);
            } else {
                setRating(newValue);
            }
        }
    });

    bookForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const imageUrl = imageUrlInput.value.trim();
        const summary = summaryTextarea.value.trim();
        const rating = parseInt(ratingInput.value, 10);
        const personalComment = personalCommentTextarea.value.trim();
        const quote = quoteTextarea.value.trim();

        if (!title || !author || !summary) {
            showModalMessage("Título, Autor e Resumo são obrigatórios.");
            return;
        }

        if (editingBookId) {
            const bookIndex = books.findIndex(b => b.id === editingBookId);
            if (bookIndex > -1) {
                books[bookIndex] = { id: editingBookId, title, author, imageUrl, summary, rating, personalComment, quote };
                showModalMessage("Livro atualizado com sucesso!");
            }
            editingBookId = null;
        } else {
            const newBook = { id: crypto.randomUUID(), title, author, imageUrl, summary, rating, personalComment, quote };
            books.push(newBook);
            showModalMessage("Livro adicionado com sucesso!");
        }
        saveBooksToStorage();
        renderBooks();
        bookForm.reset();
        setRating(0);
        showView('inventory');
    });

    function editBookHandler(id) {
        const bookToEdit = books.find(b => b.id === id);
        if (bookToEdit) {
            editingBookId = id;
            titleInput.value = bookToEdit.title;
            authorInput.value = bookToEdit.author;
            imageUrlInput.value = bookToEdit.imageUrl || '';
            summaryTextarea.value = bookToEdit.summary;
            setRating(bookToEdit.rating);
            personalCommentTextarea.value = bookToEdit.personalComment || '';
            quoteTextarea.value = bookToEdit.quote || '';
            showView('form');
            bookForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function deleteBookHandler(id) {
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        const themeColors = themes[currentTheme].vars;
        const dangerColor = currentTheme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600';
        const cancelBtnClasses = `py-1.5 px-4 rounded text-sm font-medium border 
                                  ${currentTheme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                                                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`;

        messageBoxContent.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation fa-2x mb-3" style="color: ${themeColors['--star-active-color']};"></i>
            <p class="text-lg font-semibold mb-2" style="color: ${themeColors['--text-color']};">Confirmar Exclusão</p>
            <p class="text-sm mb-5" style="color: ${themeColors['--text-muted-color']};">Tem certeza que deseja excluir este livro?</p>
            <div class="flex justify-center space-x-3">
                <button id="confirmDeleteActualBtn" class="${dangerColor} text-white py-1.5 px-4 rounded text-sm font-medium">Sim, Excluir</button>
                <button id="cancelDeleteActualBtn" class="${cancelBtnClasses}">Cancelar</button>
            </div>`;
        
        document.getElementById('confirmDeleteActualBtn').addEventListener('click', () => {
            books = books.filter(b => b.id !== id);
            saveBooksToStorage();
            renderBooks();
            messageBox.classList.add('hidden');
            showModalMessage("Livro excluído com sucesso.");
        });
        document.getElementById('cancelDeleteActualBtn').addEventListener('click', () => {
            messageBox.classList.add('hidden');
        });
        messageBox.classList.remove('hidden');
    }
    
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    const initialTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initialTheme);
    loadBooksFromStorage();
    // renderBooks(); // Será chamado por applyTheme ou showView
    showView('inventory');
    updateNavButtonStyles(initialTheme, showInventoryBtn);
});

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .custom-scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar-thin::-webkit-scrollbar-track { background: var(--scrollbar-track-bg); border-radius: 3px;}
  .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb-bg); border-radius: 3px; border: 1px solid var(--scrollbar-track-bg);}
  .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover-bg); }
`;
document.head.appendChild(styleSheet);