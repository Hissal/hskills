// TODO: load notes from disk
const notes = [];

// TODO: validate the title
function addNote(title) {
  notes.push({ title });
}

function listNotes() {
  // TODO: sort by title
  return notes.slice();
}

module.exports = { addNote, listNotes };
