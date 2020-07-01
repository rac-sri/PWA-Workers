db.enablePersistence().catch((err) => {
  if (err.code === "failed-precondition") {
    // probably multiple tabs open at once
    console.log("presistance failed");
  } else if (err.code == "unimplemented") {
    // no support
    console.log("persistance is not availaible");
  }
});

db.collection("pwa") // realtime listener
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        renderRecipt(change.doc.data(), change.doc.id);
      }

      if (change.type === "removed") {
        removeRecipe(change.doc.id);
      }
    });
  });

const form = document.querySelector("form");
form.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const data = {
    pwa: form.title.value,
    pwa2: form.ingredients.value,
  };

  db.collection("pwa").add(data).catch(console.error);

  form.title.value = "";
  form.ingredients.value = "";
});

const recipeContainer = document.querySelector(".recipes");
recipeContainer.addEventListener("click", (evt) => {
  if (evt.target.tagName === "I") {
    const id = evt.target.getAttribute("data-id");
    db.collection("pwa").doc(id).delete();
  }
});
