const modalBg = document.getElementById("modal-background");
const formContainer = document.getElementById("add-container");
const addForm = document.getElementById("add-form");
const addBtn = document.getElementById("add-btn");

let isFormVisible = false;

addBtn.addEventListener("click", () => {
  if (!isFormVisible) {
    showAddDialog();
  } else {
    hideAddDialog();
  }
});

function showAddDialog() {
  formContainer.classList.remove("a-hideForm");
  // Formulario oculto, aplica la animación de aparición
  formContainer.classList.add("a-displayForm");

  formContainer.classList.remove("hidden");
  modalBg.classList.add("show");

  isFormVisible = true; // Actualiza el estado a visible
}

function hideAddDialog() {
  formContainer.classList.remove("a-displayForm");
  formContainer.classList.add("a-hideForm");
  setTimeout(() => {
    formContainer.classList.add("hidden");
    modalBg.classList.remove("show");
  }, 200);
  isFormVisible = false;
  addForm.reset(); // Limpiar el formulario
  clearErrorDisplay();
  delete formContainer.dataset.editingNoteId; // Eliminar el estado de edición
}

// Contador de caracteres en la descripcion del dialogo
const descriptionTextarea = document.getElementById("description");
const characterCounter = document.getElementById("character-count");

descriptionTextarea.addEventListener("input", () => {
  let textLength = descriptionTextarea.value.length;
  if (textLength == 0) {
    characterCounter.textContent = 0;
  } else {
    characterCounter.textContent = textLength;
  }
})

function animateCategoryBar() {
  const links = document.querySelectorAll(".link");
  console.log(links);

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      links.forEach(link => link.classList.remove("active"));

      // Add active class to the clicked link
      link.classList.add("active");
    });
  });
}

animateCategoryBar();

// Recogemos los campos del formulario
const titleInp = document.getElementById("title");
const categoryInp = document.getElementById("category");
const descriptionInp = document.getElementById("description");

function getValues() {
  let titleValue = titleInp.value.trim("");
  let categoryValue = categoryInp.value.trim("");
  let descriptionValue = descriptionInp.value.trim("");

  const instanceValues = { titleValue, categoryValue, descriptionValue };

  return createNote(instanceValues);
}

// Array to store notes
const notes = [];

function createNote(values) {
  const title = createNewElement("h4", values.titleValue);

  const category = createNewElement("span", values.categoryValue);
  setCategoryType(category, values.categoryValue);

  const description = createNewElement("p", values.descriptionValue);
  description.classList.add("description")

  const date = setDate();
  date.classList.add("date")

  const noteElement = createNewElement("div");

  const creationDate = new Date().getTime(); // Capture timestamp in milliseconds
  noteElement.dataset.creationDate = creationDate; // Store creationDate in data attribute

  noteElement.classList.add("note", values.categoryValue.toLowerCase());
  noteElement.dataset.noteId = Math.random().toString(36).substring(2, 15); // Genera un ID random

  const { iconWrapper, icons } = setIcons();
  handleIconEvents(noteElement, icons)

  const topRow = createNewElement("div");
  topRow.classList.add("note--top-row");
  topRow.appendChild(category);
  topRow.appendChild(iconWrapper);

  noteElement.appendChild(topRow);
  noteElement.appendChild(title);
  noteElement.appendChild(description);
  noteElement.appendChild(date);

  return noteElement
}

function filterNotesByCategory(category) {
  const filteredNotes = [];
  for (const note of notes) {
    // Verifica si la nota contiene una clase de categoría
    const categoryClass = note.querySelector(`.${category.toLowerCase()}`);
    if (categoryClass && notes.length > 0) {
      filteredNotes.push(note);
    }
  }
  return filteredNotes;
}

function validateInput(input, parent) {
  // Comprueba si ya hay un mensaje de error
  let existingError = parent.querySelector(".error-message");

  if (input.value.trim() === "") {
    if (!existingError) {
      const errorMessage = createNewElement("p", "This field is required", "error-message");
      parent.appendChild(errorMessage);
    }
    return false;
  }

  // Cuando no hay errores, elimina el mensaje de error si existe
  if (existingError) {
    parent.removeChild(existingError);
  }

  return true;
}

// TODO: REFACTORIZAR
function displayNotes(filteredNotes = notes, errorContext = "default") {
  const notesList = document.getElementById("display-notes");
  notesList.innerHTML = "";
  clearErrorDisplay();

  if (filteredNotes.length === 0) {
    displayErrorMessage(errorContext);
    return
  }

  const sortedNotes = sortNotesByDate(filteredNotes);
  appendNotesToDOM(sortedNotes, notesList);
}

function sortNotesByDate(notesToSort) {
  return notesToSort.sort((a, b) => {
    const dateA = parseInt(a.dataset.creationDate, 10);
    const dateB = parseInt(b.dataset.creationDate, 10);
    return dateB - dateA; // Orden descendente, las nuevas primero
  });
}

function appendNotesToDOM(notesToAppend, notesList) {
  notesToAppend.forEach(note => {
    if (note) { // Ensure note is not undefined
      const existingNote = notesList.querySelector(`.note[data-note-id="${note.dataset.noteId}"]`);
      if (!existingNote) {
        notesList.appendChild(note); // Note doesn't exist yet, append it
      }
    }
  });
}

function displayErrorMessage(errorContext) {
  const errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = "";

  const errorMessageWrapper = createNewElement("div");
  errorMessageWrapper.classList.add("error-wrapper");

  let errorMessageText = "";
  let imgSrc = "./img/notFound.png";

  switch (errorContext) {
    case "category":
      errorMessageText = "No notes found in this category";
      break;
    case "search":
      errorMessageText = "No notes found matching your search";
      imgSrc = "./img/search-results.png"
      break;
    case "completed":
      errorMessageText = "You don't have any completed notes";
      break;
    default:
      errorMessageText = "No notes available";
      break;
  }

  const errorMessage = createNewElement("p", errorMessageText);
  errorMessage.classList.add("error-message");

  const img = createNewElement("img", "");
  img.setAttribute("src", imgSrc);

  errorMessageWrapper.appendChild(img);
  errorMessageWrapper.appendChild(errorMessage);

  errorContainer.appendChild(errorMessageWrapper);
}

function clearErrorDisplay() {
  // Contenedor de mensajes de error de las notas
  const errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = "";

  // Mensajes de error del formulario
  const errorMessage = document.querySelector(".error-message");
  if (errorMessage) {
    errorMessage.innerHTML = "";
  }
}

// Links de categorias
const categoryLinks = {
  all: document.getElementById("all"),
  personal: document.getElementById("personal"),
  home: document.getElementById("home"),
  business: document.getElementById("business")
};

// Event listeners para los links de categorias
function setupCategoryLinks() {
  Object.keys(categoryLinks).forEach(key => {
    const link = categoryLinks[key];
    link.addEventListener("click", (e) => {
      console.log("Key:", key);
      e.preventDefault();
      if (key === "all") {
        displayNotes();
        return
      }

      const filteredNotes = filterNotesByCategory(key);
      displayNotes(filteredNotes, "category");
    });
  });
}

setupCategoryLinks();

function createNewElement(element = "div", content = "", className) {
  const instanceElement = document.createElement(element);
  instanceElement.textContent = content ? content : "";

  if (className) {
    instanceElement.classList.add(className);
  }
  return instanceElement
}

function setIcons() {
  const iconWrapper = createNewElement("div");
  iconWrapper.classList.add("icon-wrapper");

  const checkboxIcon = createNewElement("img");
  checkboxIcon.setAttribute("src", "./svg/material-symbols_check-box-outline-blank.svg");
  checkboxIcon.classList.add("icon-unchecked");

  const editIcon = createNewElement("img");
  editIcon.setAttribute("src", "./svg/material-symbols_edit.svg");

  const deleteIcon = createNewElement("img");
  deleteIcon.setAttribute("src", "./svg/material-symbols_delete-rounded.svg");

  const icons = [checkboxIcon, editIcon, deleteIcon];
  icons.forEach(icon => {
    const newButton = createNewElement("button");
    newButton.classList.add("btn");
    newButton.appendChild(icon);
    iconWrapper.appendChild(newButton);
  });

  return { iconWrapper, icons };
}

function handleIconEvents(noteElement, icons) {
  const checkboxIcon = icons[0]
  checkboxIcon.addEventListener("click", () => {
    markAsCompleted(noteElement);
    toggleImage(checkboxIcon);
    saveNotesToLocalStorage();
  })

  const editIcon = icons[1];
  editIcon.addEventListener("click", () => {
    openEditDialog(noteElement);
  });

  const deleteIcon = icons[2];
  deleteIcon.addEventListener("click", () => {
    deleteNote(noteElement);
  });
}

function markAsCompleted(noteElement) {
  const title = noteElement.querySelector("h4"),
    description = noteElement.querySelector(".description");

  const components = [title, description];

  for (const component of components) {
    component.classList.toggle("completed");
  }
  noteElement.classList.toggle("op-6");
}

function toggleImage(img) {
  img.classList.toggle('icon-checked');
  img.classList.toggle('icon-unchecked');
}

function openEditDialog(noteElement) {
  const formTitle = addForm.querySelector("h2");
  formTitle.textContent = "Edit Note";

  const title = noteElement.querySelector("h4").textContent;
  const category = noteElement.querySelector("span").textContent;
  const description = noteElement.querySelector("p.description").textContent;

  document.getElementById("title").value = title;
  document.getElementById("category").value = category;
  document.getElementById("description").value = description;

  formContainer.dataset.editingNoteId = noteElement.dataset.noteId; // Guarda ID de la nota que se está editando

  showAddDialog();
}

function closeEditDialog() {
  const formTitle = addForm.querySelector("h2");
  formTitle.textContent = "Add Note";

  hideAddDialog();
  categoryLinks.all.click();
  delete formContainer.dataset.editingNoteId; // Elimina ID de la nota que se estaba editando
}

function deleteNote(noteElement) {
  Swal.fire({
    title: 'Warning!',
    text: 'Are you sure you want to delete this note?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // Elimina la nota del array de notas
      const noteId = noteElement.dataset.noteId;
      const noteIndex = notes.findIndex(note => note.dataset.noteId === noteId);

      if (noteIndex > -1) {
        notes.splice(noteIndex, 1);
        saveNotesToLocalStorage();
      }
      // Elimina el elemento del DOM
      noteElement.remove();

      Swal.fire('Deleted!', 'The note has been deleted', 'success');
    } else if (result.isDenied) {
      Swal.fire('Cancelled', 'The note has not been deleted.', 'info');
    }
  });
}

function setDate() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString();

  const noteDate = createNewElement("p", formattedDate);
  return noteDate
}

function setCategoryType(element, categoryValue) {
  element.textContent = categoryValue;
  element.className = categoryValue.toLowerCase();
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const titleParent = document.querySelector(".field-item");
  const isValid = validateInput(titleInp, titleParent);
  if (!isValid) {
    return
  }

  if (formContainer.dataset.editingNoteId) {
    handleEditNote();
  } else {
    handleAddNote();
  }
});

const cancelBtn = document.getElementById("cancelBtn");
cancelBtn.addEventListener("click", () => {
  hideAddDialog();
})

// Función para manejar la edición de notas
function handleEditNote() {
  const noteId = formContainer.dataset.editingNoteId;
  const noteToUpdate = notes.find(note => note.dataset.noteId === noteId);

  const editedTitle = document.getElementById("title").value.trim();
  const editedCategory = document.getElementById("category").value.trim();
  const editedDescription = document.getElementById("description").value.trim();

  noteToUpdate.querySelector("h4").textContent = editedTitle;
  const categoryElement = noteToUpdate.querySelector("span");
  setCategoryType(categoryElement, editedCategory);
  noteToUpdate.querySelector("p.description").textContent = editedDescription;

  // Actualiza la clase de la nota
  noteToUpdate.classList.remove("home", "personal", "business");
  noteToUpdate.classList.add(editedCategory.toLowerCase());

  saveNotesToLocalStorage();
  displayNotes();
  closeEditDialog();
}

// Función para manejar la adición de notas
function handleAddNote() {
  const newNote = getValues();
  notes.push(newNote);
  saveNotesToLocalStorage();
  
  // Añadir la nueva nota al DOM
  const notesList = document.getElementById("display-notes");
  notesList.appendChild(newNote);

  categoryLinks.all.click();

  completedCheckbox.checked = false;
  hideAddDialog();
}

const searchInp = document.getElementById("search-inp");

searchInp.addEventListener("input", () => {
  const query = searchInp.value.toLowerCase();

  const filteredNotes = notes.filter(note => {
    const title = note.querySelector("h4").textContent.toLowerCase();
    const description = note.querySelector("p.description").textContent.toLowerCase();

    return title.includes(query) || description.includes(query);
  });
  displayNotes(filteredNotes, "search");
});

const completedCheckbox = document.getElementById("checkbox");
completedCheckbox.addEventListener("click", handleCheckbox)

function handleCheckbox() {
  if (completedCheckbox.checked === true) {
    filterCompletedNotes(notes);
  } else if (completedCheckbox.checked === false) {
    categoryLinks.all.click();
  }
}

function filterCompletedNotes(notesToFilter) {
  let completedNotes = [];
  notesToFilter.forEach(note => {
    const title = note.querySelector("h4");
    if (title.classList.contains("completed")) {
      completedNotes.push(note);
    }
  });
  displayNotes(completedNotes, "completed");
}

function saveNotesToLocalStorage() {
  // Extraemos solo los datos (texto, id, estado)
  const notesData = notes.map(note => {
    return {
      id: note.dataset.noteId,
      creationDate: note.dataset.creationDate,
      title: note.querySelector("h4").textContent,
      category: note.querySelector("span").textContent,
      description: note.querySelector("p.description").textContent,
      date: note.querySelector(".date").textContent,
      isCompleted: note.querySelector("h4").classList.contains("completed")
    };
  });

  // Guardamos el array de datos simples como texto JSON
  localStorage.setItem("notes", JSON.stringify(notesData));
}

function loadNotesFromLocalStorage() {
  const savedNotes = localStorage.getItem("notes");

  // Si hay datos guardados, los procesamos
  if (savedNotes) {
    const parsedNotes = JSON.parse(savedNotes);

    parsedNotes.forEach(data => {
      // Reconstruimos el HTML para cada nota
      const noteElement = createNoteFromData(data);
      notes.push(noteElement);
    });

    displayNotes(notes);
  }
}

// Función auxiliar para reconstruir la nota a partir de los datos guardados
function createNoteFromData(data) {
  const noteElement = createNote({
    titleValue: data.title,
    categoryValue: data.category,
    descriptionValue: data.description
  });

  // Sobrescribimos el ID y las fechas generadas por las reales guardadas
  noteElement.dataset.noteId = data.id;
  noteElement.dataset.creationDate = data.creationDate;
  noteElement.querySelector(".date").textContent = data.date;

  // Si la nota estaba marcada como completada, restauramos ese estado visual
  if (data.isCompleted) {
    markAsCompleted(noteElement);
    const checkboxIcon = noteElement.querySelector(".icon-unchecked");
    if (checkboxIcon) {
      toggleImage(checkboxIcon);
    }
  }

  return noteElement;
}

document.addEventListener("DOMContentLoaded", () => {
  loadNotesFromLocalStorage();
});