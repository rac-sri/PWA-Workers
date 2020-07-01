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
      }
    });
  });
