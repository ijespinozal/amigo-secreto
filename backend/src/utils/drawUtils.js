// drawUtils.js
// Recibe array de participant objects [{id,...}, ...]
// Devuelve array de pares {giverId, receiverId} sin self-assignment
function shuffle(array) {
  for (let i = array.length -1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateAssignments(participants) {
  if (participants.length < 2) throw new Error('Se necesitan al menos 2 participantes');
  const ids = participants.map(p => p.id);
  let receivers = [...ids];
  let attempts = 0;
  // usamos algoritmo de rechazo aunque eficiente para N modestos
  do {
    shuffle(receivers);
    attempts++;
    // check no fixed point
    const hasSelf = ids.some((id, idx) => id === receivers[idx]);
    if (!hasSelf) break;
    if (attempts > 1000) throw new Error('No se pudo generar asignaciones válidas');
  } while (true);

  const pairs = ids.map((giverId, idx) => ({ giverId, receiverId: receivers[idx] }));
  return pairs;
}

module.exports = { generateAssignments };
