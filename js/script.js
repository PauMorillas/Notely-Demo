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
  setTimeout(() => {
    formContainer.classList.remove("hidden");
  }, 200);
  isFormVisible = true; // Actualiza el estado a visible
}

function hideAddDialog() {
  formContainer.classList.remove("a-displayForm");
  formContainer.classList.add("a-hideForm");
  setTimeout(() => {
    formContainer.classList.add("hidden");
  }, 200);
  isFormVisible = false;
  addForm.reset(); // Limpiar el formulario
  delete formContainer.dataset.editingNoteId; // Eliminar el estado de edición
}

// Contador de caracteres en la descripcion del dialogo
const descriptionTextarea = document.getElementById("description");
const characterCounter = document.getElementById("character-count");

descriptionTextarea.addEventListener("keyup", () => {
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

  return createNote(instanceValues); // Creamos la nota directamente en el DOM
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

  const notesList = document.getElementById("display-notes");
  clearErrorDisplay();
  notesList.appendChild(noteElement);

  return noteElement
}

function filterNotes(category) {
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

// TODO: REFACTORIZAR
function displayNotes(filteredNotes = notes) {
  if (!Array.isArray(filteredNotes)) {
    filteredNotes = [filteredNotes]; // Convert single note to an array
  }

  const notesList = document.getElementById("display-notes");
  notesList.innerHTML = ""; // Clear existing notes
  clearErrorDisplay();

  if (filteredNotes.length === 0) {
    handleError("You don't have any notes in this category.");
    return;
  }

  // Sort notes by date before displaying
  filteredNotes.sort((a, b) => {
    console.log("sorteado");
    const dateA = parseInt(a.dataset.creationDate, 10);
    const dateB = parseInt(b.dataset.creationDate, 10);
    return dateB - dateA; // Sort by descending for newest first
  });

  filteredNotes.forEach(note => {
    if (note) { // Ensure note is not undefined
      const existingNote = notesList.querySelector(`.note[data-note-id="${note.dataset.noteId}"]`);
      if (!existingNote) {
        notesList.appendChild(note); // Note doesn't exist yet, append it
      }
    }
  });
}

function handleError(message) {
  const errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = "";

  const errorMessageWrapper = createNewElement("div");
  errorMessageWrapper.classList.add("error-wrapper");

  const errorMessage = createNewElement("p", message);
  errorMessage.classList.add("error-message");

  const img = createNewElement("img");
  img.setAttribute("src", "../img/notFound.png");

  errorMessageWrapper.appendChild(img);
  errorMessageWrapper.appendChild(errorMessage);

  errorContainer.appendChild(errorMessageWrapper);
}

function clearErrorDisplay() {
  const errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = "";
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
      e.preventDefault();
      handleError("");
      if (key === "all") {
        displayNotes();
      } else {
        const filteredNotes = filterNotes(key);
        displayNotes(filteredNotes);
      }
    });
  });
}

setupCategoryLinks();

function createNewElement(element = "", content) {
  const instanceElement = document.createElement(element);
  instanceElement.textContent = content ? content : "";
  return instanceElement
}

function setIcons() {
  const iconWrapper = createNewElement("div");
  iconWrapper.classList.add("icon-wrapper");

  const checkboxIcon = createNewElement("img");
  checkboxIcon.setAttribute("src", "../svg/material-symbols_check-box-outline-blank.svg");
  checkboxIcon.classList.add("icon-unchecked");

  const editIcon = createNewElement("img");
  editIcon.setAttribute("src", "../svg/material-symbols_edit.svg");

  const deleteIcon = createNewElement("img");
  deleteIcon.setAttribute("src", "../svg/material-symbols_delete-rounded.svg");

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
  hideAddDialog();
  categoryLinks.all.click();
  delete formContainer.dataset.editingNoteId; // Elimina ID de la nota que se estaba editando
}

function deleteNote(noteElement) {
  Swal.fire({
    title: '¡Cuidado!',
    text: '¿Estás seguro de que quieres eliminar esta nota?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Elimina la nota del array de notas
      const noteId = noteElement.dataset.noteId;
      const noteIndex = notes.findIndex(note => note.dataset.noteId === noteId);

      if (noteIndex > -1) {
        notes.splice(noteIndex, 1);
      }
      // Elimina el elemento del DOM
      noteElement.remove();

      // Actualiza la visualización de las notas
      displayNotes();

      Swal.fire('Eliminado!', 'La nota ha sido eliminada.', 'success');
    } else if (result.isDenied) {
      Swal.fire('Cancelado', 'La nota no ha sido eliminada.', 'info');
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

  displayNotes();
  closeEditDialog();
}

// Función para manejar la adición de notas
function handleAddNote() {
  const newNote = getValues();
  notes.push(newNote);
  displayNotes(newNote);
  categoryLinks.all.click();
  hideAddDialog();
}