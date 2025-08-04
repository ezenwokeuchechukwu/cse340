document
  .getElementById("readButton")
  .addEventListener("click", async (event) => {
    /** @type {HTMLButtonElement} */
    const button = event.target;
    const id = button.dataset.id;
    result = await (await fetch(`/message/view/${id}/toggle-read`)).json();
    button.querySelector("img").src =
      "/images/site/" + (result ? "read-icon.svg" : "unread-icon.svg");
  });
document
  .getElementById("archiveButton")
  .addEventListener("click", async (event) => {
    /** @type {HTMLButtonElement} */
    const button = event.target;
    const id = button.dataset.id;
    result = await (await fetch(`/message/view/${id}/toggle-archived`)).json();
    button.querySelector("img").src =
      "/images/site/" + (result ? "archived-icon.svg" : "unarchived-icon.svg");
  });
