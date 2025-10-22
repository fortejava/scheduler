/**
 * Metodo che gestisce la login dell'utente
 */
function doLogin()
{
    //TODO: Gestire il login

    //Creiamo l'oggetto form che invierà i dati effettivamente al server
    const dataContainer = new FormData();

    //Popoliamo la form
    dataContainer.append("username", document.forms.loginForm.username.value);
    dataContainer.append("password", document.forms.loginForm.password.value);
    dataContainer.append("token","");

    //Creiamo l'oggetto XMLHttpRequest che invii i dati al server
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            switch (this.status)
            {
                case 200:
                    //TODO: Risposta arrivata correttamente dal server

                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    loginWorker(res);
                break;

                default:
                    console.log("Si è verificato un errore, riprova più tardi");
                break;

                
            }
        }
    }

    xhr.open("POST", "/services/Login.ashx", true);
    xhr.send(dataContainer);

    event.preventDefault();
    event.stopPropagation();
}

/**
 * Funzione che elabora la risposta del server alla richiesta di login
 * @param {any} res
 */
function loginWorker(res)
{
    switch (res.Code)
    {
        case "ok":
        {
                //Nome utente e password sono corretti, per cui dobbiamo:
                //1: inserire username e password in localStorage

                localStorage.setItem("username", document.forms.loginForm.username.value);
                localStorage.setItem("token", res.Message.Token);

                //2: Mostare la vista calendario
                showView("calendar-view");

        } break;

        case "ko":
        {
        } break;
    }
}

/**
 * Funzione che nasconde tutti gli elementi di classe view, tranne l'elemento con id = idToShow
 * 
 * @param {any} viewtoShow l'id della vista da mostrare
 */
function showView(viewToShow)
{
    //Cicliamo su tutte le viste
    const viewsList = document.querySelectorAll(".view");

    for (el of [...viewsList])
    {
        el.classList.add("view-hidden");
    }

    const visibleElement = document.querySelector(`#${viewToShow}`);
    visibleElement.classList.remove("view-hidden");

}